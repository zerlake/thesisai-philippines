'use client';

import { Award, Users, Target, Zap } from 'lucide-react';
import Link from 'next/link';

interface TeamMember {
  name: string;
  role: string;
  bio: string;
}

interface Value {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const values: Value[] = [
  {
    icon: <Target className="h-8 w-8" />,
    title: 'Student-Centric',
    description:
      'Everything we build is designed with students in mind. We understand the challenges of academic writing and research.',
  },
  {
    icon: <Award className="h-8 w-8" />,
    title: 'Academic Excellence',
    description:
      'We promote integrity and excellence in academic work while making high-quality tools accessible to all students.',
  },
  {
    icon: <Zap className="h-8 w-8" />,
    title: 'Innovation',
    description:
      'We leverage cutting-edge AI technology to provide intelligent, reliable assistance for academic tasks.',
  },
  {
    icon: <Users className="h-8 w-8" />,
    title: 'Community',
    description:
      'We believe in building a supportive community where students can grow, learn, and excel together.',
  },
];

const teamMembers: TeamMember[] = [
  {
    name: 'Sarah Johnson',
    role: 'Co-Founder & CEO',
    bio: 'Former educator with 10+ years of experience in academic writing and student success.',
  },
  {
    name: 'Dr. Michael Chen',
    role: 'Co-Founder & Chief Academic Officer',
    bio: 'PhD in Education with expertise in AI and learning technology.',
  },
  {
    name: 'Emily Rodriguez',
    role: 'Head of Product',
    bio: 'Product strategist focused on solving real student problems with elegant solutions.',
  },
  {
    name: 'James Wilson',
    role: 'Lead Engineer',
    bio: 'Full-stack engineer passionate about building scalable, user-friendly platforms.',
  },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {/* Hero Section */}
      <div className="border-b border-slate-700/50 bg-slate-900">
        <div className="mx-auto max-w-4xl px-4 py-20 sm:px-6 lg:px-8">
          <h1 className="text-5xl font-bold text-white">About ThesisAI</h1>
          <p className="mt-6 text-xl text-slate-300">
            Empowering students with intelligent AI tools for academic excellence and research success.
          </p>
        </div>
      </div>

      {/* Mission Section */}
      <div className="border-b border-slate-700/50">
        <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="grid gap-12 md:grid-cols-2">
            <div>
              <h2 className="text-3xl font-bold text-white">Our Mission</h2>
              <p className="mt-4 text-lg text-slate-300">
                To democratize access to advanced academic tools and make high-quality writing and research assistance available to every student, regardless of background or economic status.
              </p>
              <p className="mt-4 text-lg text-slate-300">
                We believe that every student deserves the support to reach their academic potential. ThesisAI combines powerful AI technology with educational expertise to help students write better essays, conduct stronger research, and achieve their academic goals.
              </p>
            </div>
            <div>
              <h2 className="text-3xl font-bold text-white">Our Vision</h2>
              <p className="mt-4 text-lg text-slate-300">
                To become the essential AI companion for student success worldwide, trusted by millions of students and educators for improving academic quality and integrity.
              </p>
              <p className="mt-4 text-lg text-slate-300">
                We envision a future where AI-powered tools enhance rather than replace critical thinking, where technology supports academic growth, and where every student has access to the resources they need to succeed.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Values Section */}
      <div className="border-b border-slate-700/50 bg-slate-800">
        <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-white">Our Values</h2>
          <p className="mt-2 text-slate-300">
            These principles guide everything we do at ThesisAI.
          </p>
          <div className="mt-12 grid gap-8 sm:grid-cols-2">
            {values.map((value) => (
              <div key={value.title} className="rounded-lg bg-slate-700 p-6 shadow-sm">
                <div className="text-blue-400">{value.icon}</div>
                <h3 className="mt-4 text-xl font-bold text-white">
                  {value.title}
                </h3>
                <p className="mt-2 text-slate-300">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Team Section */}
      <div className="border-b border-slate-700/50">
        <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-white">Meet the Team</h2>
          <p className="mt-2 text-slate-300">
            Passionate educators and technologists dedicated to your academic success.
          </p>
          <div className="mt-12 grid gap-8 sm:grid-cols-2">
            {teamMembers.map((member) => (
              <div
                key={member.name}
                className="rounded-lg border border-slate-700 bg-slate-800 p-6"
              >
                <div className="h-24 w-24 rounded-full bg-gradient-to-br from-blue-400 to-blue-600" />
                <h3 className="mt-4 text-lg font-bold text-white">
                  {member.name}
                </h3>
                <p className="text-blue-400 font-semibold">{member.role}</p>
                <p className="mt-3 text-slate-300">{member.bio}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="border-b border-slate-700/50 bg-slate-800">
        <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-white">By the Numbers</h2>
          <div className="mt-12 grid gap-8 sm:grid-cols-4">
            <div className="text-center">
              <p className="text-4xl font-bold text-blue-400">100K+</p>
              <p className="mt-2 text-slate-300">Students Served</p>
            </div>
            <div className="text-center">
              <p className="text-4xl font-bold text-blue-400">5M+</p>
              <p className="mt-2 text-slate-300">Essays Enhanced</p>
            </div>
            <div className="text-center">
              <p className="text-4xl font-bold text-blue-400">50+</p>
              <p className="mt-2 text-slate-300">Countries</p>
            </div>
            <div className="text-center">
              <p className="text-4xl font-bold text-blue-400">4.9★</p>
              <p className="mt-2 text-slate-300">User Rating</p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-12 text-white">
          <h2 className="text-3xl font-bold">Ready to start your academic journey?</h2>
          <p className="mt-2 text-blue-100">
            Join thousands of students using ThesisAI to improve their writing and research.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/signup"
              className="rounded-lg bg-white px-8 py-3 font-semibold text-blue-600 hover:bg-blue-50"
            >
              Sign Up Free
            </Link>
            <Link
              href="/contact"
              className="rounded-lg border border-white px-8 py-3 font-semibold text-white hover:bg-blue-700"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
