import { useMemo } from 'react'
import { About } from '../sections/About'
import { Contact } from '../sections/Contact'
import { Education } from '../sections/Education'
import { Experience } from '../sections/Experience'
import { FeaturedProjects } from '../sections/FeaturedProjects'
import { Hero } from '../components/Hero/Hero'
import { ResumeSection } from '../sections/ResumeSection'
import { Services } from '../sections/Services'
import { Skills } from '../sections/Skills'
import { env } from '../config/env'
import { useProfile } from '../hooks/usePortfolio'
import { useSeo } from '../hooks/useSeo'

export default function HomePage() {
  const { data } = useProfile()
  const profile = data?.data?.profile

  const jsonLd = useMemo(
    () =>
      profile && {
        '@context': 'https://schema.org',
        '@type': 'Person',
        name: profile.full_name,
        jobTitle: profile.title,
        alumniOf: { '@type': 'CollegeOrUniversity', name: 'Rungta College of Engineering and Technology, Raipur' },
        description: profile.summary,
        url: env.siteUrl,
        address: { '@type': 'PostalAddress', addressLocality: 'Raipur', addressRegion: 'Chhattisgarh', addressCountry: 'IN' },
        knowsAbout: ['HTML5', 'CSS3', 'JavaScript', 'Bootstrap', 'Tailwind CSS', 'PHP', 'Laravel', 'REST API', 'MySQL', 'React.js', 'UI/UX Design'],
        sameAs: [profile.github_url, profile.linkedin_url].filter(Boolean),
      },
    [profile],
  )

  useSeo({ title: null, description: profile?.meta_description, jsonLd })

  return (
    <>
      <Hero />
      <About />
      <Skills />
      <FeaturedProjects />
      <Experience />
      <Education index="05" />
      <Services index="06" />
      <ResumeSection />
      <Contact index="07" />
    </>
  )
}
