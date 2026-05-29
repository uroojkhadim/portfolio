import { motion } from 'framer-motion'
import { skillCategories } from '../../data/skills'
import { SectionHeading, FadeIn } from '../ui/Shared'

function SkillCard({ category, index }) {
  const Icon = category.icon

  return (
    <FadeIn delay={index * 0.06}>
      <div className="glass-card group h-full p-6 transition-all hover:-translate-y-1 hover:shadow-glow">
        <div className="mb-5 flex items-center gap-3">
          <div
            className={`flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${category.color} text-white shadow-lg`}
          >
            <Icon size={20} />
          </div>
          <h3 className="font-display text-lg font-bold text-slate-900 dark:text-white">
            {category.title}
          </h3>
        </div>

        <div className="flex flex-wrap gap-2">
          {category.skills.map((skill) => (
            <span
              key={skill.name}
              className="rounded-lg border border-slate-200/80 bg-white/60 px-3 py-1.5 text-xs font-medium text-slate-700 transition-colors group-hover:border-indigo-200 dark:border-slate-700 dark:bg-slate-800/50 dark:text-slate-300 dark:group-hover:border-indigo-500/30"
            >
              {skill.name}
            </span>
          ))}
        </div>

        <div className="mt-5 space-y-3">
          {category.skills.slice(0, 3).map((skill) => (
            <div key={skill.name}>
              <div className="mb-1.5 flex justify-between text-xs">
                <span className="font-medium text-slate-600 dark:text-slate-400">{skill.name}</span>
                <span className="text-indigo-600 dark:text-indigo-400">{skill.level}%</span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-slate-200/80 dark:bg-slate-700/80">
                <motion.div
                  initial={{ width: 0 }}
                  whileInView={{ width: `${skill.level}%` }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
                  className={`h-full rounded-full bg-gradient-to-r ${category.color}`}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </FadeIn>
  )
}

export default function Skills() {
  return (
    <section id="skills" className="section-padding relative bg-slate-50/50 dark:bg-slate-900/30">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute right-0 top-1/4 h-64 w-64 rounded-full bg-indigo-400/10 blur-3xl" />
      </div>

      <div className="section-container relative">
        <SectionHeading
          eyebrow="Skills"
          title="Technologies & competencies"
          description="A curated overview of my technical skills, tools, and professional competencies."
        />

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {skillCategories.map((category, index) => (
            <SkillCard key={category.id} category={category} index={index} />
          ))}
        </div>
      </div>
    </section>
  )
}
