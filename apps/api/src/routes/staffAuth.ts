import { Router, Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { ObjectId } from "mongodb";
import { staffAccounts, StaffAccountDoc, StaffRole } from "../collections";
import { getDb } from "../db";

export const staffAuthRouter = Router();

const JWT_SECRET = process.env.STAFF_JWT_SECRET || process.env.JWT_SECRET || "enginow_staff_super_secret_jwt_key_2026";

export interface AuthenticatedStaffRequest extends Request {
  staff?: {
    staffId: string;
    email: string;
    role: StaffRole;
    name: string;
  };
}

// ─── Default Staff Accounts ──────────────────────────────────────────────────
const DEFAULT_STAFF: Array<{
  email: string;
  username: string;
  password: string;
  role: StaffRole;
  name: string;
}> = [
  {
    email: "shadanmd566@gmail.com",
    username: "shadanmd566",
    password: "Shadan123@",
    role: "admin",
    name: "Shadan MD",
  },
  {
    email: "admin@enginow.in",
    username: "admin",
    password: "password@123",
    role: "admin",
    name: "Admin Lead",
  },
  {
    email: "hr@enginow.in",
    username: "hr",
    password: "password@123",
    role: "hr",
    name: "HR Manager",
  },
  {
    email: "educator@enginow.in",
    username: "educator",
    password: "password@123",
    role: "educator",
    name: "Lead Educator",
  },
  {
    email: "sales@enginow.in",
    username: "sales",
    password: "password@123",
    role: "sales",
    name: "Sales Director",
  },
];

export async function seedStaffAccounts() {
  try {
    const col = staffAccounts();
    for (const member of DEFAULT_STAFF) {
      const existing = await col.findOne({
        $or: [
          { email: member.email.toLowerCase() },
          { username: member.username.toLowerCase() },
        ],
      });

      const hash = bcrypt.hashSync(member.password, 10);

      if (!existing) {
        await col.insertOne({
          _id: new ObjectId(),
          email: member.email.toLowerCase(),
          username: member.username.toLowerCase(),
          passwordHash: hash,
          role: member.role,
          name: member.name,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
        console.log(`[Staff Auth] Seeded staff account: ${member.email} (${member.role})`);
      } else {
        // Ensure credentials and role match requested configuration
        await col.updateOne(
          { _id: existing._id },
          {
            $set: {
              passwordHash: hash,
              role: member.role,
              name: member.name,
              isActive: true,
              updatedAt: new Date(),
            },
          }
        );
      }
    }
  } catch (error) {
    console.error("[Staff Auth] Error seeding staff accounts:", error);
  }
}

// ─── Staff Token Verification Middleware ────────────────────────────────────
export function requireStaffAuth(req: AuthenticatedStaffRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({ error: "Unauthorized: Missing or invalid staff token." });
    return;
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as {
      staffId: string;
      email: string;
      role: StaffRole;
      name: string;
    };
    req.staff = decoded;
    next();
  } catch (err) {
    res.status(401).json({ error: "Unauthorized: Invalid or expired staff token." });
  }
}

export function requireStaffRole(allowedRoles: StaffRole[]) {
  return (req: AuthenticatedStaffRequest, res: Response, next: NextFunction): void => {
    requireStaffAuth(req, res, () => {
      if (!req.staff) {
        res.status(401).json({ error: "Unauthorized: Staff authentication required." });
        return;
      }

      if (!allowedRoles.includes(req.staff.role)) {
        res.status(403).json({
          error: `Forbidden: Your role (${req.staff.role.toUpperCase()}) does not have permission for this resource. Required: ${allowedRoles.join(", ").toUpperCase()}`,
        });
        return;
      }

      next();
    });
  };
}

// ─── Login Endpoint ─────────────────────────────────────────────────────────
staffAuthRouter.post("/login", async (req: Request, res: Response): Promise<void> => {
  try {
    const { identifier, email, username, password, portal } = req.body;
    const loginId = (identifier || email || username || "").trim().toLowerCase();

    if (!loginId || !password) {
      res.status(400).json({ error: "Please provide both ID/Email and Password." });
      return;
    }

    const account = await staffAccounts().findOne({
      $or: [
        { email: loginId },
        { username: loginId },
      ],
      isActive: true,
    });

    if (!account) {
      res.status(401).json({ error: "Invalid staff credentials." });
      return;
    }

    const validPassword = bcrypt.compareSync(password, account.passwordHash);
    if (!validPassword) {
      res.status(401).json({ error: "Invalid staff credentials." });
      return;
    }

    // Strict portal privilege check (admins have universal access)
    if (portal && portal !== account.role && account.role !== "admin") {
      const portalFormatted = portal.charAt(0).toUpperCase() + portal.slice(1);
      res.status(403).json({
        error: `Access Denied: This credential does not have ${portalFormatted} portal privileges. (Assigned role: ${account.role.toUpperCase()})`,
      });
      return;
    }

    const token = jwt.sign(
      {
        staffId: account._id.toString(),
        email: account.email,
        role: account.role,
        name: account.name,
      },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      token,
      staff: {
        id: account._id.toString(),
        name: account.name,
        email: account.email,
        username: account.username,
        role: account.role,
      },
    });
  } catch (error: any) {
    console.error("[Staff Auth Login Error]:", error);
    res.status(500).json({ error: error.message || "Internal server error" });
  }
});

// ─── Get Current Staff Session ──────────────────────────────────────────────
staffAuthRouter.get("/me", requireStaffAuth, async (req: AuthenticatedStaffRequest, res: Response): Promise<void> => {
  try {
    const account = await staffAccounts().findOne({
      _id: new ObjectId(req.staff!.staffId),
      isActive: true,
    });

    if (!account) {
      res.status(404).json({ error: "Staff account not found or deactivated." });
      return;
    }

    res.json({
      staff: {
        id: account._id.toString(),
        name: account.name,
        email: account.email,
        username: account.username,
        role: account.role,
        phone: account.phone || "",
        settings: account.settings || {},
      },
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ─── Update Current Staff Session ───────────────────────────────────────────
staffAuthRouter.patch("/me", requireStaffAuth, async (req: AuthenticatedStaffRequest, res: Response): Promise<void> => {
  try {
    const { name, email, phone, settings } = req.body;
    
    const updateData: any = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email.toLowerCase();
    if (phone !== undefined) updateData.phone = phone;
    if (settings) updateData.settings = settings;

    if (Object.keys(updateData).length === 0) {
      res.status(400).json({ error: "No fields to update." });
      return;
    }

    updateData.updatedAt = new Date();

    const result = await staffAccounts().findOneAndUpdate(
      { _id: new ObjectId(req.staff!.staffId) },
      { $set: updateData },
      { returnDocument: "after" }
    );

    if (!result) {
      res.status(404).json({ error: "Staff account not found." });
      return;
    }

    res.json({
      staff: {
        id: result._id.toString(),
        name: result.name,
        email: result.email,
        username: result.username,
        role: result.role,
        phone: result.phone || "",
        settings: result.settings || {},
      },
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ─── Change Password ─────────────────────────────────────────────────────────
staffAuthRouter.patch("/change-password", requireStaffAuth, async (req: AuthenticatedStaffRequest, res: Response): Promise<void> => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      res.status(400).json({ error: "currentPassword and newPassword are required." });
      return;
    }
    if (newPassword.length < 8) {
      res.status(400).json({ error: "New password must be at least 8 characters." });
      return;
    }

    const account = await staffAccounts().findOne({ _id: new ObjectId(req.staff!.staffId) });
    if (!account) {
      res.status(404).json({ error: "Account not found." });
      return;
    }

    const valid = bcrypt.compareSync(currentPassword, account.passwordHash);
    if (!valid) {
      res.status(401).json({ error: "Current password is incorrect." });
      return;
    }

    const newHash = bcrypt.hashSync(newPassword, 10);
    await staffAccounts().updateOne(
      { _id: account._id },
      { $set: { passwordHash: newHash, updatedAt: new Date() } }
    );

    res.json({ success: true, message: "Password changed successfully." });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ─── Logout Endpoint ────────────────────────────────────────────────────────
staffAuthRouter.post("/logout", (req: Request, res: Response) => {
  res.json({ success: true, message: "Logged out successfully." });
});
