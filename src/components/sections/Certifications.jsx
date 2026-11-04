import { Award, ExternalLink, Calendar } from 'lucide-react'
import { usePortfolioData } from '../../context/DataContext'
import { SectionHeading, FadeIn } from '../ui/Shared'

export default function Certifications() {
  const { certificates } = usePortfolioData()
  const items = Array.isArray(certificates) ? certificates : []

  return (
    <section id="certifications" className="section-padding relative">
      <div className="section-container relative">
        <SectionHeading
          eyebrow="Credentials"
          title="Certifications &amp; professional learning"
          description="Verified certificates and credentials completed alongside academic and professional work."
        />

        {items.length === 0 ? (
          <FadeIn>
            <div className="glass-card mx-auto max-w-2xl border border-dashed border-slate-300 p-8 text-center dark:border-slate-700">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                <Award size={22} />
              </div>
              <p className="mt-3 text-sm font-medium text-slate-700 dark:text-slate-300">
                Certifications are being updated.
              </p>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                Internship certificates are available in the Experience section, or contact me directly for details.
              </p>
            </div>
          </FadeIn>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((cert, index) => (
              <FadeIn key={cert.id || cert.title} delay={index * 0.05}>
                <div className="glass-card flex h-full flex-col overflow-hidden border border-slate-200/80 dark:border-slate-800">
                  {cert.image_url && (
                    <div className="aspect-[16/10] w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
                      <img
                        src={cert.image_url}
                        alt={`${cert.title} certificate`}
                        loading="lazy"
                        className="h-full w-full object-cover"
                        onError={(event) => { event.currentTarget.style.display = 'none' }}
                      />
                    </div>
                  )}
                  <div className="flex flex-1 flex-col p-5">
                    <div className="flex items-start gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                        <Award size={17} />
                      </div>
                      <div>
                        <h3 className="font-display text-base font-bold text-slate-900 dark:text-white">
                          {cert.title}
                        </h3>
                        {cert.issuer && (
                          <p className="text-xs font-medium text-indigo-600 dark:text-indigo-400">{cert.issuer}</p>
                        )}
                      </div>
                    </div>

                    {cert.issue_date && (
                      <p className="mt-3 flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                        <Calendar size={12} /> Issued {cert.issue_date}
                      </p>
                    )}

                    {cert.description && (
                      <p className="mt-2 flex-1 text-xs leading-relaxed text-slate-600 dark:text-slate-400">
                        {cert.description}
                      </p>
                    )}

                    {cert.credential_url && (
                      <a
                        href={cert.credential_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:underline dark:text-indigo-400"
                        aria-label={`Verify ${cert.title} credential`}
                      >
                        <ExternalLink size={13} /> Verify credential
                      </a>
                    )}
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
