import NextAuth from "next-auth";

const tenantId = process.env.AUTH_MICROSOFT_ENTRA_ID_TENANT_ID || "";
const ciamDomain = `${tenantId}.ciamlogin.com`;

export const { handlers, signIn, signOut, auth } = NextAuth({
  debug: true,
  providers: [
    {
      id: "microsoft-entra-id",
      name: "Microsoft Entra ID",
      type: "oauth",
      clientId: process.env.AUTH_MICROSOFT_ENTRA_ID_ID || "",
      clientSecret: process.env.AUTH_MICROSOFT_ENTRA_ID_SECRET || "",
      authorization: {
        url: `https://${ciamDomain}/${tenantId}/oauth2/v2.0/authorize`,
        params: {
          scope: "openid profile email",
          response_type: "code",
        },
      },
      token: `https://${ciamDomain}/${tenantId}/oauth2/v2.0/token`,
      userinfo: `https://graph.microsoft.com/oidc/userinfo`,
      checks: ["pkce", "state"],
      profile(profile: { sub: string; name: string; email: string }) {
        return {
          id: profile.sub,
          name: profile.name,
          email: profile.email,
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
