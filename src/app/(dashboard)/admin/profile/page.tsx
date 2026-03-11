import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { AvatarDisplay } from "@/components/shared/avatar-display";
import { ProfileEditor } from "@/components/profile/profile-editor";
import { ShieldCheck } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminProfilePage() {
  const session = await getSession();
  if (!session || session.role !== "admin") redirect("/login");

  const [user] = await db
    .select({ displayName: users.displayName, username: users.username, email: users.email, avatar: users.avatar, avatarChangedAt: users.avatarChangedAt })
    .from(users)
    .where(eq(users.id, session.id));

  const name = user?.displayName ?? user?.username ?? session.name;

  return (
    <div className="p-6 max-w-2xl mx-auto flex flex-col gap-6">
      {/* Caution road stripe */}
      <div style={{ height:"5px",background:"repeating-linear-gradient(90deg,#FFD700 0,#FFD700 20px,#0a0e1a 20px,#0a0e1a 40px)" }} />

      {/* Profile header card */}
      <div style={{ display:"flex",alignItems:"center",gap:"20px",padding:"20px",background:"#111827",border:"2px solid #FFD700",boxShadow:"5px 5px 0 #FFD700" }}>
        <AvatarDisplay avatar={user?.avatar ?? null} name={name} size={80} radius={0} />
        <div>
          <h1 style={{ fontSize:"20px",fontWeight:900,color:"#f0f2f5",marginBottom:"4px" }}>{name}</h1>
          <p style={{ fontSize:"13px",color:"#a8a8a8",marginBottom:"10px" }}>{user?.email}</p>
          <div style={{ display:"inline-flex",alignItems:"center",gap:"6px",padding:"4px 10px",background:"rgba(255,0,80,0.1)",border:"2px solid #ff0050",boxShadow:"2px 2px 0 #ff0050" }}>
            <ShieldCheck style={{ width:"11px",height:"11px",color:"#ff0050" }} />
            <span style={{ fontSize:"10px",fontWeight:900,color:"#ff0050",textTransform:"uppercase",letterSpacing:"0.1em" }}>Admin</span>
          </div>
        </div>
      </div>

      {/* Section label with longitudinal marking */}
      <div style={{ display:"flex",alignItems:"center",gap:"10px" }}>
        <div style={{ flex:1,height:"2px",background:"repeating-linear-gradient(90deg,#FFD700 0,#FFD700 10px,transparent 10px,transparent 20px)" }} />
        <span style={{ fontSize:"10px",fontWeight:900,color:"#FFD700",textTransform:"uppercase",letterSpacing:"0.14em" }}>Edit Profile</span>
        <div style={{ flex:1,height:"2px",background:"repeating-linear-gradient(90deg,#FFD700 0,#FFD700 10px,transparent 10px,transparent 20px)" }} />
      </div>

      <ProfileEditor
        initialName={name}
        initialAvatar={user?.avatar ?? null}
        initialAvatarChangedAt={user?.avatarChangedAt?.toISOString() ?? null}
        role="admin"
      />
    </div>
  );
}
