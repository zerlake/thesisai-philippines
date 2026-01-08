'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export type TestimonialData = {
  content: string;
  full_name: string;
  course: string;
  institution: string;
}

export async function submitTestimonial(data: TestimonialData) {
  const supabase = createClient()

  // Get current user
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return { error: 'Unauthorized' }
  }

  // Insert testimonial
  const { error } = await supabase.from('testimonials').insert({
    user_id: user.id,
    content: data.content,
    full_name: data.full_name,
    course: data.course,
    institution: data.institution,
    status: 'pending'
  })

  if (error) {
    console.error('Error submitting testimonial:', error)
    return { error: 'Failed to submit testimonial' }
  }

  revalidatePath('/admin/testimonials')
  return { success: true }
}
