import NextAuth from "next-auth";
import MicrosoftEntraID from "next-auth/providers/microsoft-entra-id";

const tenantId = process.env.AUTH_MICROSOFT_ENTRA_ID_TENANT_ID!;

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    MicrosoftEntraID({
      clientId: process.env.AUTH_MICROSOFT_ENTRA_ID_ID!,
      clientSecret: process.env.AUTH_MICROSOFT_ENTRA_ID_SECRET!,
      issuer: `https://login.microsoftonline.com/${tenantId}/v2.0`,
      authorization: {
        params: {
          scope: "openid profile email",
        },
      },
    }),
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
