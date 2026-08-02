import { Request, Response, NextFunction } from "express";
import { getAdminAuth } from "../firebase";

export interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    email: string | null;
    claims: any;
  };
}

export async function requireFirebaseAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  // --- Development Bypass for Mock Dashboards ---
  const mockRole = req.headers["x-mock-role"];
  if (mockRole && process.env.NODE_ENV !== "production") {
    req.user = {
      userId: `mock-${mockRole}-id`,
      email: `mock-${mockRole}@enginow.com`,
      claims: { role: mockRole },
    };
    
    // Auto-grant the role in DB for the mock user
    const { userRoles } = require("../collections");
    await userRoles().updateOne(
      { userId: req.user.userId, role: mockRole },
      { $setOnInsert: { userId: req.user.userId, role: mockRole } },
      { upsert: true }
    );
    return next();
  }
  // ----------------------------------------------

  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized: Missing or malformed Authorization header" });
  }

  const idToken = authHeader.replace("Bearer ", "").trim();
  if (!idToken) {
    return res.status(401).json({ error: "Unauthorized: Empty token" });
  }

  try {
    const decodedToken = await getAdminAuth().verifyIdToken(idToken);
    req.user = {
      userId: decodedToken.uid,
      email: decodedToken.email ?? null,
      claims: decodedToken,
    };
    next();
  } catch (err) {
    console.error("Auth error:", err);
    return res.status(401).json({ error: "Unauthorized: Invalid or expired Firebase token" });
  }
}
