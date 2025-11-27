'use client';

import { Users, UserPlus, MessageCircle } from 'lucide-react';
import type { z } from 'zod';
import type { CollaborationWidgetSchema } from '@/lib/dashboard/widget-schemas';

type CollaborationData = z.infer<typeof CollaborationWidgetSchema>;

interface CollaborationWidgetProps {
  data?: CollaborationData;
}

const statusIndicator: Record<string, string> = {
  active: 'bg-green-500',
  idle: 'bg-yellow-500',
  offline: 'bg-gray-400',
};

export function CollaborationWidget({ data }: CollaborationWidgetProps) {
  if (!data) return null;

  const displayMembers = data.teamMembers.slice(0, 4);

  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-cyan-600" />
          <h3 className="text-lg font-semibold text-gray-900">Collaboration</h3>
        </div>
        <span className="text-xs bg-cyan-100 text-cyan-800 px-2 py-1 rounded-full font-medium">
          {data.activeNow} online
        </span>
      </div>

      {data.totalMembers > 0 ? (
        <>
          <div className="mb-4">
            <p className="text-xs text-gray-600 mb-3 font-medium">Team Members</p>
            <div className="flex items-center gap-2 mb-4">
              {displayMembers.map((member) => (
                <div
                  key={member.id}
                  className="relative group"
                  title={member.name}
                >
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-600 flex items-center justify-center text-white text-sm font-medium">
                    {member.name.charAt(0).toUpperCase()}
                  </div>
                  <div
                    className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${
                      statusIndicator[member.status]
                    }`}
                  />
                  <div className="absolute bottom-full left-0 mb-2 hidden group-hover:block bg-gray-900 text-white text-xs rounded px-2 py-1 whitespace-nowrap">
                    {member.name}
                  </div>
                </div>
              ))}
              {data.teamMembers.length > 4 && (
                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-700 text-xs font-medium">
                  +{data.teamMembers.length - 4}
                </div>
              )}
            </div>
          </div>

          {data.recentActivity.length > 0 && (
            <div className="border-t border-gray-200 pt-4">
              <p className="text-xs text-gray-600 mb-3 font-medium">
                Recent Activity
              </p>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {data.recentActivity.slice(0, 3).map((activity, idx) => (
                  <div key={`${activity.userId}-${idx}`} className="flex items-start gap-2 text-xs">
                    <MessageCircle className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-gray-900 font-medium">
                        {activity.action}
                      </p>
                      <p className="text-gray-500 text-xs mt-0.5">
                        {new Date(activity.timestamp).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="py-8 text-center">
          <UserPlus className="w-8 h-8 text-gray-400 mx-auto mb-2" />
          <p className="text-sm text-gray-600 mb-4">
            No team members yet
          </p>
          <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
            Invite teammates
          </button>
        </div>
      )}

      {data.pendingInvites.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className="text-xs text-gray-600 font-medium mb-2">
            Pending Invites
          </p>
          <p className="text-xs text-gray-600">
            {data.pendingInvites.length} pending
          </p>
        </div>
      )}
    </div>
  );
}
