import { ImageResponse } from 'next/og';
import { ReactElement } from 'react';

export const runtime = 'edge';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Define mapping for different avatar types
    const avatarConfig: Record<string, { text: string; bgColor: string }> = {
      'default': { text: 'U', bgColor: '#3B82F6' }, // Blue
      'user-round': { text: 'USR', bgColor: '#10B981' }, // Emerald
      'circle-user': { text: 'C', bgColor: '#8B5CF6' }, // Violet 
      'user-2': { text: 'U2', bgColor: '#EC4899' }, // Pink
      'bot': { text: '🤖', bgColor: '#6366F1' }, // Indigo
      'brain': { text: '🧠', bgColor: '#F59E0B' }, // Amber
      'graduation-cap': { text: '🎓', bgColor: '#10B981' }, // Emerald
      'user-icon': { text: '👤', bgColor: '#EF4444' }, // Red
      'eye': { text: '👁️', bgColor: '#8B5CF6' }, // Violet
      'star': { text: '⭐', bgColor: '#FBBF24' }, // Amber
      'heart': { text: '❤️', bgColor: '#EF4444' }, // Red
      'moon': { text: '🌙', bgColor: '#F97316' }, // Orange
      'sun': { text: '☀️', bgColor: '#FACC15' }, // Yellow
      'flower': { text: '🌸', bgColor: '#EC4899' }, // Pink
      'mountain': { text: '⛰️', bgColor: '#64748B' }, // Slate
      'globe': { text: '🌐', bgColor: '#3B82F6' }, // Blue
    };

    const config = avatarConfig[id] || { text: '?', bgColor: '#6B7280' }; // Gray for unknown

    return new ImageResponse(
      (
        <div
          style={{
            display: 'flex',
            fontSize: 96,
            background: config.bgColor,
            width: '100%',
            height: '100%',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '50%',
            color: 'white',
          } as React.CSSProperties}
        >
          {config.text}
        </div>
      ) as ReactElement,
      {
        width: 200,
        height: 200,
      }
    );
  } catch (error) {
    console.error('Error generating avatar:', error);
    return new Response('Failed to generate avatar', {
      status: 500,
    });
  }
}