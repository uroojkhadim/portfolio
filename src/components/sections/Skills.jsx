import { motion } from 'framer-motion'
import { Star, CheckCircle2, Code2, Globe2, Smartphone, Database, BrainCircuit, Wrench } from 'lucide-react'
import { skillCategories as fallbackSkillCategories } from '../../data/skills'
import { usePortfolioData } from '../../context/DataContext'
import { SectionHeading, FadeIn } from '../ui/Shared'

const ICON_MAP = {
  Code2,
  Globe2,
  Smartphone,
  Database,
  BrainCircuit,
  Wrench,
}

function SkillCard({ category, index }) {
  const Icon = category.icon

  return (
    <FadeIn delay={index * 0.06}>
      <div className="glass-card group flex h-full flex-col justify-between border border-slate-200/80 p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-glow dark:border-slate-800 sm:p-7">
        <div>
          {/* Header */}
          <div className="mb-4 flex items-center gap-3.5">
            <div
              className={`flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${category.gradient} text-white shadow-md shadow-indigo-500/20 transition-transform duration-300 group-hover:scale-105`}
            >
              <Icon size={20} strokeWidth={2} />
            </div>
            <div>
              <h3 className="font-display text-base font-bold text-slate-900 dark:text-white sm:text-lg">
                {category.title}
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {category.skills.length} Competencies
              </p>
            </div>
          </div>

          <p className="mb-5 text-xs leading-relaxed text-slate-600 dark:text-slate-400">
            {category.description}
          </p>

          {/* Skill Pills */}
          <div className="flex flex-wrap gap-1.5 sm:gap-2">
            {category.skills.map((skill) => (
              <motion.div
                key={skill.name}
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.15 }}
                className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-medium transition-colors ${
                  skill.highlight
                    ? 'border-indigo-200/80 bg-indigo-50/80 text-indigo-900 shadow-sm dark:border-indigo-500/30 dark:bg-indigo-500/15 dark:text-indigo-200'
                    : 'border-slate-200/70 bg-white/70 text-slate-700 hover:border-slate-300 dark:border-slate-700/80 dark:bg-slate-800/60 dark:text-slate-300 dark:hover:border-slate-600'
                }`}
              >
                {skill.highlight ? (
                  <Star size={11} className="shrink-0 text-indigo-500 dark:text-indigo-400" />
                ) : (
                  <CheckCircle2 size={11} className="shrink-0 text-slate-400 dark:text-slate-500" />
                )}
                <span>{skill.name}</span>
                {skill.tag && (
                  <span className="rounded bg-slate-200/60 px-1 py-0.2 text-[9px] font-semibold text-slate-600 dark:bg-slate-700/60 dark:text-slate-300">
                    {skill.tag}
                  </span>
                )}
              </motion.div>
            ))}
          </div>
        </div>

        <div className="mt-5 border-t border-slate-100 pt-3 text-[11px] font-medium text-slate-400 dark:border-slate-800/80 dark:text-slate-500">
          Applied across active projects &amp; academic labs
        </div>
      </div>
    </FadeIn>
  )
}

export default function Skills() {
  const { apiSkillCategories } = usePortfolioData()

  const categories = (apiSkillCategories && apiSkillCategories.length > 0)
    ? apiSkillCategories.map(cat => ({
        ...cat,
        icon: ICON_MAP[cat.icon_name] || Code2,
        skills: cat.skills || []
      }))
    : fallbackSkillCategories

  return (
    <section id="skills" className="section-padding relative bg-slate-50/50 dark:bg-slate-900/30">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute right-0 top-1/4 h-72 w-72 rounded-full bg-indigo-400/10 blur-3xl" />
        <div className="absolute bottom-10 left-10 h-72 w-72 rounded-full bg-violet-400/10 blur-3xl" />
      </div>

      <div className="section-container relative">
        <SectionHeading
          eyebrow="Skills &amp; Technologies"
          title="Technical Competencies &amp; Stack"
          description="Verified development stack and tools based on production implementations, academic coursework, and industry internships."
        />

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((category, index) => (
            <SkillCard key={category.id || category.category_key} category={category} index={index} />
          ))}
        </div>
      </div>
    </section>
  )
}
