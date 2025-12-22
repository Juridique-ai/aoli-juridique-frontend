import NextAuth from "next-auth";

const tenantId = process.env.AUTH_MICROSOFT_ENTRA_ID_TENANT_ID || "";
const ciamDomain = `${tenantId}.ciamlogin.com`;

export const { handlers, signIn, signOut, auth } = NextAuth({
  debug: true,
  providers: [
    {
      id: "microsoft-entra-id",
      name: "Microsoft Entra ID",
      type: "oidc",
      clientId: process.env.AUTH_MICROSOFT_ENTRA_ID_ID || "",
      clientSecret: process.env.AUTH_MICROSOFT_ENTRA_ID_SECRET || "",
      issuer: `https://${ciamDomain}/${tenantId}/v2.0`,
      authorization: {
        params: {
          scope: "openid profile email",
        },
      },
      checks: ["pkce", "state"],
      profile(profile: { sub: string; name?: string; email?: string; preferred_username?: string }) {
        return {
          id: profile.sub,
          name: profile.name || profile.preferred_username || "",
          email: profile.email || profile.preferred_username || "",
        };
      },
    },
  ],
  callbacks: {
    async jwt({ token, account, profile }) {
      if (account) {
        token.accessToken = account.access_token;
        token.idToken = account.id_token;
      }
      return token;
    },
    async session({ session, token }) {
      return {
        ...session,
        accessToken: token.accessToken,
      };
    },
  },
  pages: {
    signIn: "/login",
    error: "/auth/error",
  },
  trustHost: true,
});
