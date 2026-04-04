import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "Acceptable Use Policy",
  description: "Acceptable Use Policy for Tunnl."
};

export default function AupPage() {
  return (
    <article className="[&_h1]:font-display [&_h2]:font-display [&_h3]:font-display max-w-3xl text-sm leading-7 text-stone-400 sm:text-[15px] [&_code]:rounded [&_code]:bg-amber-500/8 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:text-[0.95em] [&_code]:text-stone-100 [&_h1]:text-4xl [&_h1]:leading-tight [&_h1]:font-bold [&_h1]:tracking-tight [&_h1]:text-stone-100 sm:[&_h1]:text-5xl [&_h2]:mt-12 [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:tracking-tight [&_h2]:text-stone-100 sm:[&_h2]:text-3xl [&_h3]:mt-10 [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:tracking-tight [&_h3]:text-stone-100 sm:[&_h3]:text-xl [&_ol]:list-decimal [&_ol]:space-y-3 [&_ol]:pl-6 [&_p]:mt-4 [&_strong]:font-semibold [&_strong]:text-stone-100">
      <h1>{"Acceptable Use Policy for Tunnl"}</h1>

      <p>{"Last Updated: April 5, 2026"}</p>

      <p>
        {
          'This Acceptable Use Policy ("AUP") explains prohibited uses of the Tunnl Services, including the Tunnl websites, CLI, hosted relay, cloud dashboard, local inspector, APIs, subdomains, share features, and related offerings (collectively, the "Services").'
        }
      </p>

      <p>
        {
          "This AUP is incorporated into the Tunnl Terms of Service. Capitalized terms not defined here have the meanings given in the Terms of Service."
        }
      </p>

      <h2>{"1. Purpose"}</h2>

      <p>
        {
          "Tunnl is designed for legitimate software development, testing, debugging, webhook inspection, request replay, mock event generation, and related operational use cases."
        }
      </p>

      <p>
        {
          "You may use the Services only in ways that are lawful, authorized, technically responsible, and consistent with the security and stability of the Services and third-party systems."
        }
      </p>

      <h2>{"2. Prohibited Content and Conduct"}</h2>

      <p>
        {
          "You may not use the Services to create, store, transmit, replay, inspect, forward, share, or otherwise make available any content or traffic that:"
        }
      </p>

      <ol>
        <li>
          {
            "Violates any law, regulation, court order, or governmental requirement."
          }
        </li>
        <li>
          {
            "Infringes, misappropriates, or otherwise violates any person's or entity's intellectual property, privacy, publicity, confidentiality, or other rights."
          }
        </li>
        <li>
          {
            "Is deceptive, fraudulent, defamatory, harassing, threatening, hateful, exploitative, or otherwise abusive."
          }
        </li>
        <li>
          {
            "Promotes violence, terrorism, child sexual abuse material, or any content involving the exploitation of minors."
          }
        </li>
        <li>
          {
            "Contains malware, malicious code, spyware, ransomware, trojans, worms, time bombs, or other harmful or disruptive components."
          }
        </li>
        <li>
          {
            "Facilitates credential theft, phishing, fraud, social engineering, or impersonation."
          }
        </li>
        <li>
          {
            "Includes stolen data, unlawfully obtained credentials, or personal information collected without authorization."
          }
        </li>
      </ol>

      <h2>{"3. Unauthorized Access and Network Abuse"}</h2>

      <p>{"You may not use the Services to:"}</p>

      <ol>
        <li>
          {
            "Gain unauthorized access to any system, account, network, device, or data."
          }
        </li>
        <li>
          {
            "Probe, scan, crawl, or test the vulnerability of systems or networks without authorization."
          }
        </li>
        <li>
          {
            "Intercept, inspect, route, or replay traffic that you are not authorized to receive and process."
          }
        </li>
        <li>
          {"Bypass authentication, authorization, or access restrictions."}
        </li>
        <li>
          {
            "Conceal malicious traffic, evade security tools, or anonymize abusive activity through Tunnl infrastructure."
          }
        </li>
        <li>
          {
            "Launch, relay, or facilitate denial-of-service attacks, flooding, resource exhaustion, or other disruptive behavior."
          }
        </li>
        <li>
          {
            "Operate open proxies, abusive redirectors, or hidden forwarding services not consistent with the intended use of Tunnl."
          }
        </li>
      </ol>

      <h2>{"4. Abuse of Public URLs and Subdomains"}</h2>

      <p>
        {
          "You may not use Tunnl-issued URLs, subdomains, or routing identifiers to:"
        }
      </p>

      <ol>
        <li>
          {
            "Impersonate another person, company, government entity, or service."
          }
        </li>
        <li>
          {
            "Mislead others about the source, owner, or purpose of a site, endpoint, or integration."
          }
        </li>
        <li>
          {"Infringe another party's trademark, trade name, or brand rights."}
        </li>
        <li>
          {
            "Host deceptive landing pages, phishing endpoints, malware distribution points, or credential collection flows."
          }
        </li>
        <li>
          {
            "Operate public-facing services unrelated to legitimate development, testing, debugging, or other uses expressly approved by Tunnl."
          }
        </li>
      </ol>

      <p>
        {
          "Tunnl may suspend, reassign, or disable any subdomain or URL at any time to address abuse, legal risk, infringement complaints, or operational concerns."
        }
      </p>

      <h2>{"5. Spam, Fraud, and Deceptive Activity"}</h2>

      <p>{"You may not use the Services to:"}</p>

      <ol>
        <li>{"Send spam or unsolicited communications."}</li>
        <li>
          {
            "Generate fake sign-ins, fake transactions, or fake engagement in a deceptive or fraudulent manner."
          }
        </li>
        <li>
          {
            "Conduct scams, financial fraud, ad fraud, affiliate abuse, or other dishonest schemes."
          }
        </li>
        <li>
          {
            "Misrepresent the origin or authenticity of a webhook, request, event, or payload for unlawful purposes."
          }
        </li>
      </ol>

      <h2>{"6. High-Risk and Restricted Uses"}</h2>

      <p>{"You may not use the Services in connection with:"}</p>

      <ol>
        <li>
          {
            "Activities that could reasonably result in death, bodily injury, or significant physical or environmental harm if the Services fail."
          }
        </li>
        <li>{"Weapons development or deployment."}</li>
        <li>{"Illegal surveillance, stalking, or unlawful monitoring."}</li>
        <li>
          {
            "Processing regulated data in environments where Tunnl has not expressly agreed in writing to support the required compliance obligations."
          }
        </li>
        <li>
          {
            "Any activity prohibited by applicable export controls, sanctions laws, or trade restrictions."
          }
        </li>
      </ol>

      <h2>{"7. Security and Platform Integrity"}</h2>

      <p>{"You may not:"}</p>

      <ol>
        <li>
          {
            "Interfere with or disrupt the integrity, availability, performance, or security of the Services."
          }
        </li>
        <li>
          {
            "Circumvent quotas, authentication requirements, rate limits, usage limits, or feature restrictions."
          }
        </li>
        <li>
          {
            "Attempt to reverse engineer, scrape, or extract non-public aspects of the Services except as allowed by law or expressly permitted by Tunnl."
          }
        </li>
        <li>
          {"Use automated means to overload or destabilize Tunnl systems."}
        </li>
        <li>
          {
            "Attempt to access another customer's data, traffic, account, workspace, or subdomain without authorization."
          }
        </li>
      </ol>

      <h2>{"8. Responsible Handling of Data"}</h2>

      <p>
        {
          "You are responsible for what you expose through Tunnl and what data you choose to route through the Services."
        }
      </p>

      <p>
        {
          "You may not use the Services to process or transmit data where you lack a lawful basis or authorization to do so. You should not expose sensitive systems or endpoints to the public internet through Tunnl unless you understand and accept the associated risks and have implemented appropriate safeguards."
        }
      </p>

      <h2>{"9. Monitoring and Enforcement"}</h2>

      <p>
        {
          "Tunnl may investigate suspected violations of this AUP, the Terms of Service, or applicable law. To protect the Services, users, and third parties, Tunnl may, with or without notice:"
        }
      </p>

      <ol>
        <li>
          {
            "Remove, block, or disable content, traffic, links, subdomains, or accounts."
          }
        </li>
        <li>{"Suspend or terminate access to the Services."}</li>
        <li>{"Rate-limit or restrict traffic or features."}</li>
        <li>{"Preserve relevant logs and information."}</li>
        <li>
          {
            "Report suspected unlawful activity to law enforcement, regulators, affected third parties, or other appropriate entities."
          }
        </li>
      </ol>

      <h2>{"10. Reporting Abuse"}</h2>

      <p>
        <>
          {
            "If you believe the Services are being used in violation of this AUP, contact us at "
          }
          <a
            href="mailto:abuse@usetunnl.com"
            className="text-amber-400 hover:text-amber-300"
          >
            {"abuse@usetunnl.com"}
          </a>
          {" with relevant details, including:"}
        </>
      </p>

      <ol>
        <li>
          {"The affected subdomain, URL, workspace, or account, if known."}
        </li>
        <li>{"A description of the conduct."}</li>
        <li>
          {
            "Supporting timestamps, request samples, screenshots, or other evidence."
          }
        </li>
      </ol>

      <h2>{"11. Changes to This AUP"}</h2>

      <p>
        {
          'Tunnl may update this AUP from time to time by posting a revised version and updating the "Last Updated" date. If you continue to use the Services after the revised AUP becomes effective, you agree to the updated AUP.'
        }
      </p>
    </article>
  );
}
