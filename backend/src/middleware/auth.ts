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
