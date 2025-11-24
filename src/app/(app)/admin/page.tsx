"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, University, MessageCircleQuestion, Banknote, Network } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default function AdminDashboardPage() {
  return (
    <div className="container mx-auto py-8">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold mb-2">Admin Dashboard</h1>
        <p className="text-xl text-muted-foreground">
          System overview and management tools
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* User Management Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <CardTitle>User Management</CardTitle>
                <CardDescription>Manage user roles and advisor assignments</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link href="/admin/users">Manage Users</Link>
            </Button>
          </CardContent>
        </Card>

        {/* Institution Requests Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <University className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <CardTitle>Institution Requests</CardTitle>
                <CardDescription>Approve or decline new institution submissions</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link href="/admin/institutions">View Requests</Link>
            </Button>
          </CardContent>
        </Card>

        {/* Testimonials Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <MessageCircleQuestion className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <CardTitle>Testimonials</CardTitle>
                <CardDescription>Approve or reject user-submitted testimonials</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link href="/admin/testimonials">Manage Testimonials</Link>
            </Button>
          </CardContent>
        </Card>

        {/* Payout Requests Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-100 rounded-lg">
                <Banknote className="h-6 w-6 text-amber-600" />
              </div>
              <div>
                <CardTitle>Payout Requests</CardTitle>
                <CardDescription>Process or decline user payout requests</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link href="/admin/payouts">Process Payouts</Link>
            </Button>
          </CardContent>
        </Card>

        {/* MCP Servers Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-100 rounded-lg">
                <Network className="h-6 w-6 text-indigo-600" />
              </div>
              <div>
                <CardTitle>MCP Servers</CardTitle>
                <CardDescription>Manage Model Context Protocol servers</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link href="/admin/mcp-servers">Manage MCP</Link>
            </Button>
          </CardContent>
        </Card>

        {/* Puter.js Integration Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-100 rounded-lg">
                <MessageCircleQuestion className="h-6 w-6 text-emerald-600" />
              </div>
              <div>
                <CardTitle>Puter.js Integration</CardTitle>
                <CardDescription>Manage AI services authentication</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full" id="puter-auth-btn">
              <Link href="/admin/puter-auth">Configure AI</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}