import { About } from '../sections/About'
import { Contact } from '../sections/Contact'
import { Education } from '../sections/Education'
import { Experience } from '../sections/Experience'
import { ResumeSection } from '../sections/ResumeSection'
import { Services } from '../sections/Services'
import { Skills } from '../sections/Skills'
import { useSeo } from '../hooks/useSeo'

/** Standalone pages that reuse the home-page sections in "full" mode. */
function PageShell({ children }) {
  return <div className="pt-16 sm:pt-20">{children}</div>
}

export function AboutPage() {
  useSeo({ title: 'About', description: 'Frontend & PHP/Laravel developer in Raipur with 3.8+ years of experience — responsive UI, Laravel, REST APIs, MySQL and React.js.' })
  return (
    <PageShell>
      <About full index={null} />
      <Experience index={null} />
      <Education index={null} />
    </PageShell>
  )
}

export function SkillsPage() {
  useSeo({ title: 'Skills & Technologies', description: 'HTML5, CSS3, JavaScript, Bootstrap, Tailwind CSS, PHP, Laravel, REST APIs, MySQL, React.js and the tools I use daily.' })
  return (
    <PageShell>
      <Skills full index={null} />
    </PageShell>
  )
}

export function ExperiencePage() {
  useSeo({ title: 'Experience', description: 'Professional web development experience and education of Ashwani Kumar Kushwaha.' })
  return (
    <PageShell>
      <Experience full index={null} />
      <Education index={null} />
    </PageShell>
  )
}

export function ServicesPage() {
  useSeo({ title: 'Services', description: 'Website development, UI/UX, PHP & Laravel, REST APIs, React.js and admin panel development.' })
  return (
    <PageShell>
      <Services full index={null} />
      <Contact index={null} />
    </PageShell>
  )
}

export function ResumePage() {
  useSeo({ title: 'Resume', description: 'Download the latest résumé of Ashwani Kushwaha, full-stack developer.' })
  return (
    <PageShell>
      <ResumeSection full />
      <Skills index={null} />
    </PageShell>
  )
}

export function ContactPage() {
  useSeo({ title: 'Contact', description: 'Get in touch about a website, PHP/Laravel or React project.' })
  return (
    <PageShell>
      <Contact full index={null} />
    </PageShell>
  )
}
