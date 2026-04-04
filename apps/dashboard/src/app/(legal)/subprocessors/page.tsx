import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Subprocessors",
  description: "Subprocessors used by Tunnl."
};

export default function SubprocessorsPage() {
  return (
    <article className="[&_h1]:font-display [&_h2]:font-display max-w-4xl text-sm leading-7 text-stone-400 sm:text-[15px] [&_code]:rounded [&_code]:bg-amber-500/8 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:text-[0.95em] [&_code]:text-stone-100 [&_h1]:text-4xl [&_h1]:leading-tight [&_h1]:font-bold [&_h1]:tracking-tight [&_h1]:text-stone-100 sm:[&_h1]:text-5xl [&_h2]:mt-12 [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:tracking-tight [&_h2]:text-stone-100 sm:[&_h2]:text-3xl [&_p]:mt-4 [&_strong]:font-semibold [&_strong]:text-stone-100">
      <h1>{"Subprocessors"}</h1>

      <p>{"Last Updated: April 5, 2026"}</p>

      <p>
        {
          "This page identifies the third-party subprocessors Tunnl currently uses to provide and support the Services. It is intended to supplement the Data Processing Addendum and Privacy Policy."
        }
      </p>

      <h2>{"Current Subprocessors"}</h2>

      <div className="mt-6 overflow-x-auto rounded-xl border border-white/8 bg-white/2">
        <table className="min-w-full border-collapse text-left">
          <thead className="bg-white/3 text-xs tracking-[0.16em] text-stone-300 uppercase">
            <tr>
              <th className="px-4 py-3 font-medium">Provider</th>
              <th className="px-4 py-3 font-medium">Purpose</th>
              <th className="px-4 py-3 font-medium">Service Scope</th>
            </tr>
          </thead>
          <tbody className="align-top text-sm text-stone-400">
            <tr className="border-t border-white/6">
              <td className="px-4 py-4 font-medium text-stone-100">
                {"Cloudflare"}
              </td>
              <td className="px-4 py-4">
                {"DNS and related edge network services."}
              </td>
              <td className="px-4 py-4">
                {
                  "Domain management and DNS routing for Tunnl-controlled properties."
                }
              </td>
            </tr>
            <tr className="border-t border-white/6">
              <td className="px-4 py-4 font-medium text-stone-100">
                {"Vercel"}
              </td>
              <td className="px-4 py-4">
                {
                  "Hosting and delivery for the marketing site and cloud dashboard."
                }
              </td>
              <td className="px-4 py-4">
                {"Website and dashboard infrastructure."}
              </td>
            </tr>
            <tr className="border-t border-white/6">
              <td className="px-4 py-4 font-medium text-stone-100">
                {"Fly.io"}
              </td>
              <td className="px-4 py-4">
                {
                  "Hosting for the relay server used to receive and forward traffic."
                }
              </td>
              <td className="px-4 py-4">
                {"Relay infrastructure for tunnel traffic."}
              </td>
            </tr>
            <tr className="border-t border-white/6">
              <td className="px-4 py-4 font-medium text-stone-100">
                {"Clerk"}
              </td>
              <td className="px-4 py-4">
                {"User authentication and account access management."}
              </td>
              <td className="px-4 py-4">
                {"Authentication flows for account-based features."}
              </td>
            </tr>
            <tr className="border-t border-white/6">
              <td className="px-4 py-4 font-medium text-stone-100">
                {"Convex"}
              </td>
              <td className="px-4 py-4">
                {"Application data storage for paid customer historical data."}
              </td>
              <td className="px-4 py-4">
                {"Persistent historical request data for paid plans."}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <h2>{"Change Management"}</h2>

      <p>
        {
          "Tunnl may update this list from time to time as our infrastructure and service providers evolve. Material changes to subprocessors for customer personal data will be handled in accordance with the Tunnl Data Processing Addendum."
        }
      </p>

      <h2>{"Contact"}</h2>

      <p>
        <>
          {"Questions about subprocessors or data handling can be sent to "}
          <a
            href="mailto:privacy@usetunnl.com"
            className="text-amber-400 hover:text-amber-300"
          >
            {"privacy@usetunnl.com"}
          </a>
          {"."}
        </>
      </p>
    </article>
  );
}
