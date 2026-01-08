'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Star } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

type Testimonial = {
  id: string
  content: string
  full_name?: string
  course?: string
  institution?: string
  profiles?: {
    first_name: string | null
    last_name: string | null
  }
}

export function DynamicTestimonials() {
  const [dbTestimonials, setDbTestimonials] = useState<Testimonial[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchTestimonials() {
      try {
        const supabase = createClient()
        const { data, error } = await supabase
          .from('testimonials')
          .select('id, content, full_name, course, institution, profiles:user_id(first_name, last_name)')
          .eq('status', 'approved')
          .order('created_at', { ascending: false })
          .limit(4)

        if (!error && data) {
          // @ts-ignore
          setDbTestimonials(data)
        }
      } catch (e) {
        console.error('Error fetching testimonials:', e)
      } finally {
        setLoading(false)
      }
    }

    fetchTestimonials()
  }, [])

  if (loading || dbTestimonials.length === 0) {
    return null
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto mb-16">
      {dbTestimonials.map((testimonial, index) => {
        const displayName = testimonial.full_name ||
          (testimonial.profiles?.first_name
            ? `${testimonial.profiles.first_name} ${testimonial.profiles.last_name || ''}`
            : 'Anonymous Student')

        const displayRole = (testimonial.course && testimonial.institution)
          ? `${testimonial.course}, ${testimonial.institution}`
          : testimonial.course || testimonial.institution || 'Student'

        const avatarInitial = displayName.charAt(0).toUpperCase()

        return (
          <motion.div
            key={testimonial.id}
            className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6 backdrop-blur-sm transform-gpu"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            viewport={{ once: true, margin: "-100px" }}
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-lg">
                {avatarInitial}
              </div>
              <div>
                <div className="font-semibold text-white">{displayName}</div>
                <div className="text-sm text-slate-400">{displayRole}</div>
              </div>
            </div>
            <div className="flex gap-1 mb-3" role="img" aria-label="5 out of 5 stars">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" aria-hidden="true" />
              ))}
            </div>
            <p className="text-slate-300 italic">"{testimonial.content}"</p>
          </motion.div>
        )
      })}
    </div>
  )
}
