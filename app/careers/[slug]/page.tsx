import Link from "next/link"
import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { ArrowLeft, MapPin, Clock, Check, Briefcase, Building2 } from "lucide-react"
import { ROLES, getRoleBySlug, HIRING_STEPS, formatPosted } from "@/lib/careers-data"
import { SITE_URL } from "@/lib/site"
import { CareerApplicationForm } from "@/components/career-application-form"
import { CopyLinkButton } from "@/components/copy-link-button"

export function generateStaticParams() {
  return ROLES.map((r) => ({ slug: r.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const role = getRoleBySlug(slug)
  if (!role) return {}
  const title = `${role.title} — ${role.type} · ${role.location} | GiGi Energy Careers`
  const description = `${role.salary} • ${role.blurb} Apply in 5 minutes. We reply within 48 hours.`
  const url = `${SITE_URL}/careers/${role.slug}`
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      type: "article",
    },
  }
}

export default async function CareerRolePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const role = getRoleBySlug(slug)
  if (!role) notFound()

  const jobPostingLd = {
    "@context": "https://schema.org",
    "@type": "JobPosting",
    title: role.title,
    description: `${role.summary}\n\nResponsibilities:\n${role.responsibilities.join("\n")}\n\nRequirements:\n${role.requirements.join("\n")}\n\nNice to have:\n${role.niceToHave.join("\n")}`,
    datePosted: role.postedAt,
    validThrough: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    employmentType: role.employmentType,
    hiringOrganization: {
      "@type": "Organization",
      name: "GiGi Energy",
      sameAs: SITE_URL,
      logo: `${SITE_URL}/apple-icon.png`,
    },
    jobLocation: {
      "@type": "Place",
      address: {
        "@type": "PostalAddress",
        addressLocality: "Nairobi",
        addressCountry: "KE",
      },
    },
    baseSalary: {
      "@type": "MonetaryAmount",
      currency: "KES",
      value: {
        "@type": "QuantitativeValue",
        minValue: role.salaryMinKes,
        maxValue: role.salaryMaxKes,
        unitText: "MONTH",
      },
    },
    applicantLocationRequirements: {
      "@type": "Country",
      name: "Kenya",
    },
    directApply: true,
    url: `${SITE_URL}/careers/${role.slug}`,
  }

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "Careers", item: `${SITE_URL}/careers` },
      { "@type": "ListItem", position: 3, name: role.title, item: `${SITE_URL}/careers/${role.slug}` },
    ],
  }

  return (
    <div className="min-h-screen bg-[#121212]">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jobPostingLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />

      <div className="max-w-7xl mx-auto px-6 py-10 md:py-12 pb-20">
        <Link href="/careers" className="inline-flex items-center gap-2 text-white/60 hover:text-[#AFFF00] font-mono text-sm mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back to Careers
        </Link>

        <div className="grid lg:grid-cols-12 gap-8 items-start">
          {/* Main */}
          <div className="lg:col-span-8">
            <div className="inline-flex items-center gap-2 bg-[#AFFF00] text-[#121212] px-3 py-1 font-mono text-xs font-bold tracking-widest">
              {role.department.toUpperCase()} • {role.workModel.toUpperCase()}
            </div>
            <h1 className="text-3xl md:text-5xl font-black text-white tracking-tighter mt-3 leading-[0.95]">{role.title}</h1>
            <div className="flex flex-wrap items-center gap-3 mt-4">
              <span className="inline-flex items-center gap-1.5 bg-white/5 border border-white/10 text-white/60 font-mono text-xs px-2.5 py-1.5">
                <Clock className="w-3.5 h-3.5" /> {role.type}
              </span>
              <span className="inline-flex items-center gap-1.5 bg-white/5 border border-white/10 text-white/60 font-mono text-xs px-2.5 py-1.5">
                <MapPin className="w-3.5 h-3.5" /> {role.location}
              </span>
              <span className="inline-flex items-center gap-1.5 bg-[#AFFF00] text-[#121212] font-mono text-xs font-bold px-2.5 py-1.5">{role.salary}</span>
              <span className="text-white/30 font-mono text-xs">Posted {formatPosted(role.postedAt)}</span>
            </div>

            <p className="text-white/60 font-mono text-sm mt-6 leading-relaxed max-w-2xl">{role.summary}</p>

            <div className="flex flex-wrap gap-3 mt-6">
              <a href="#apply" className="bg-[#AFFF00] text-[#121212] px-6 py-3 font-black text-sm inline-flex items-center gap-2">
                Apply — 5 min
              </a>
              <Link href="/careers" className="border border-white/10 text-white px-6 py-3 font-bold text-sm hover:border-[#AFFF00]/30 transition-colors">
                View all roles
              </Link>
            </div>

            <div className="mt-10 grid md:grid-cols-3 gap-6">
              <div className="md:col-span-2 space-y-8">
                <section>
                  <h2 className="text-white font-black text-sm tracking-wide flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-[#AFFF00]" /> WHAT YOU&apos;LL OWN
                  </h2>
                  <ul className="mt-4 space-y-3">
                    {role.responsibilities.map((r) => (
                      <li key={r} className="flex gap-3 text-white/60 font-mono text-sm leading-relaxed">
                        <span className="text-[#AFFF00]">—</span> {r}
                      </li>
                    ))}
                  </ul>
                </section>

                <section>
                  <h2 className="text-white font-black text-sm tracking-wide flex items-center gap-2">
                    <Check className="w-4 h-4 text-[#AFFF00]" /> MUST-HAVES
                  </h2>
                  <p className="text-white/30 font-mono text-xs mt-1">Only 3–5 real requirements. No 15-item wish lists.</p>
                  <ul className="mt-4 space-y-3">
                    {role.requirements.map((r) => (
                      <li key={r} className="flex gap-3 text-white/70 font-mono text-sm leading-relaxed">
                        <span className="w-1.5 h-1.5 bg-[#AFFF00] mt-2 shrink-0" /> {r}
                      </li>
                    ))}
                  </ul>
                </section>

                <section>
                  <h2 className="text-white font-black text-sm">NICE TO HAVE</h2>
                  <ul className="mt-4 space-y-2">
                    {role.niceToHave.map((r) => (
                      <li key={r} className="flex gap-3 text-white/40 font-mono text-sm leading-relaxed">
                        <span className="text-white/20">•</span> {r}
                      </li>
                    ))}
                  </ul>
                </section>
              </div>

              <div className="space-y-4">
                <div className="bg-white/5 border border-white/10 p-5">
                  <h3 className="text-white font-bold text-sm">Perks</h3>
                  <ul className="mt-3 space-y-2">
                    {role.perks.map((p) => (
                      <li key={p} className="flex gap-2 text-white/50 font-mono text-xs">
                        <Check className="w-3.5 h-3.5 text-[#AFFF00] mt-0.5 shrink-0" /> {p}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="bg-[#AFFF00] p-5 text-[#121212]">
                  <h3 className="font-black text-sm">Fast process</h3>
                  <p className="font-mono text-xs mt-1 leading-relaxed">We reply within 48 hours. Full loop 1–2 weeks. No ghosting.</p>
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    {HIRING_STEPS.map((s) => (
                      <div key={s.n} className="bg-[#121212] text-white p-3">
                        <p className="font-mono text-[11px] text-[#AFFF00]">{s.n}</p>
                        <p className="font-bold text-xs mt-1">{s.title.split("—")[0].trim()}</p>
                        <p className="font-mono text-[11px] text-white/40 mt-1">{s.time}</p>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="bg-white/5 border border-white/10 p-5">
                  <h3 className="text-white font-bold text-sm flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-[#AFFF00]" /> About GiGi
                  </h3>
                  <p className="text-white/50 font-mono text-xs mt-2 leading-relaxed">
                    Nairobi-built energy drink. Zero sugar, 75mg natural caffeine. We&apos;re 12 people proving a world-class brand can be born here.
                  </p>
                  <Link href="/about" className="text-[#AFFF00] font-mono text-xs mt-3 inline-block hover:underline">
                    Our story →
                  </Link>
                </div>
              </div>
            </div>

            {/* Apply */}
            <div id="apply" className="scroll-mt-24 mt-12 bg-white/5 border border-white/10 p-6 md:p-8">
              <h2 className="text-2xl font-black text-white tracking-tight">Apply for {role.title}</h2>
              <p className="text-white/50 font-mono text-sm mt-2">
                5 minutes. Name, email, short note, optional resume & portfolio. We reply within 48 hours. Questions?{" "}
                <a href="mailto:careers@gigi.energy" className="text-[#AFFF00] hover:underline">
                  careers@gigi.energy
                </a>
              </p>
              <div className="mt-6">
                <CareerApplicationForm defaultRoleSlug={role.slug} />
              </div>
            </div>

            {/* Other roles */}
            <div className="mt-10">
              <h3 className="text-white font-black text-sm mb-4">Other open roles</h3>
              <div className="grid md:grid-cols-2 gap-4">
                {ROLES.filter((r) => r.slug !== role.slug).map((r) => (
                  <Link
                    key={r.slug}
                    href={`/careers/${r.slug}`}
                    className="bg-white/5 border border-white/10 p-5 hover:border-[#AFFF00]/30 transition-colors group"
                  >
                    <p className="text-[#AFFF00] font-mono text-xs">{r.department} • {r.type}</p>
                    <p className="text-white font-bold text-sm mt-1 group-hover:text-[#AFFF00] transition-colors">{r.title}</p>
                    <p className="text-white/40 font-mono text-xs mt-2">{r.salary}</p>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar sticky */}
          <div className="lg:col-span-4 lg:sticky lg:top-24 space-y-4">
            <div className="bg-white/5 border border-white/10 p-6">
              <h3 className="text-white font-bold text-sm">At a glance</h3>
              <div className="mt-4 space-y-3 text-sm font-mono">
                <div className="flex justify-between">
                  <span className="text-white/40">Location</span>
                  <span className="text-white">{role.location}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/40">Type</span>
                  <span className="text-white">{role.type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/40">Pay</span>
                  <span className="text-[#AFFF00] font-bold">{role.salary}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/40">Posted</span>
                  <span className="text-white">{formatPosted(role.postedAt)}</span>
                </div>
              </div>
              <a href="#apply" className="mt-6 bg-[#AFFF00] text-[#121212] w-full py-3 font-black text-sm text-center block">
                Apply now
              </a>
              <p className="text-white/30 font-mono text-[11px] mt-3 text-center">No account required • 5 min</p>
            </div>

            <div className="bg-[#121212] border border-white/10 p-6">
              <h3 className="text-white font-bold text-sm">Share this role</h3>
              <p className="text-white/40 font-mono text-xs mt-2">Know someone perfect? Send them the direct link.</p>
              <div className="mt-4 flex gap-2">
                <a
                  href={`https://wa.me/?text=${encodeURIComponent(`${role.title} at GiGi Energy — ${SITE_URL}/careers/${role.slug}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 bg-white/5 border border-white/10 text-white font-mono text-xs py-2 text-center hover:border-[#AFFF00]/30"
                >
                  WhatsApp
                </a>
                <a
                  href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(`${SITE_URL}/careers/${role.slug}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 bg-white/5 border border-white/10 text-white font-mono text-xs py-2 text-center hover:border-[#AFFF00]/30"
                >
                  LinkedIn
                </a>
              </div>
              <CopyLinkButton url={`${SITE_URL}/careers/${role.slug}`} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
