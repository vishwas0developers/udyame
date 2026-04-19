"use client";

import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Users, 
  Cpu, 
  HelpCircle, 
  Activity, 
  CheckCircle2, 
  XCircle, 
  Settings2,
  AlertTriangle
} from "lucide-react";

interface PendingQuestion {
  id: string;
  text: string;
  industry: string;
  generated_at: string;
}

const PENDING_QUESTIONS: PendingQuestion[] = [
  { id: "1", text: "How do you handle inventory seasonal spikes?", industry: "Retail", generated_at: "2h ago" },
  { id: "2", text: "What is your primary tech stack for scalability?", industry: "Tech", generated_at: "5h ago" },
];

interface SystemMetric {
  label: string;
  value: string;
  icon: any;
  color: string;
}

const SYSTEM_METRICS: SystemMetric[] = [
  { label: "Active Users", value: "1,248", icon: Users, color: "text-blue-600" },
  { label: "AI Models Healthy", value: "4/4", icon: Cpu, color: "text-emerald-600" },
  { label: "Pending Reviews", value: "12", icon: HelpCircle, color: "text-amber-600" },
  { label: "API Latency", value: "240ms", icon: Activity, color: "text-purple-600" },
];

export default function AdminDashboard() {
  return (
    <div className="container mx-auto py-10 px-4 space-y-10 max-w-7xl">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">Admin Control Center</h1>
          <p className="text-slate-500 mt-2 text-lg">Monitor system health and moderate self-learned AI content.</p>
        </div>
        <Button variant="outline" className="gap-2">
          <Settings2 className="w-4 h-4" /> System Config
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {SYSTEM_METRICS.map((metric) => (
          <Card key={metric.label} className="border-none shadow-sm bg-white dark:bg-slate-900 border border-slate-100">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardDescription className="text-sm font-semibold text-slate-500 uppercase tracking-wider">{metric.label}</CardDescription>
              <metric.icon className={`w-5 h-5 ${metric.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{metric.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 shadow-sm border-slate-200">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-xl">Question Approval Queue</CardTitle>
              <CardDescription>AI-generated questions requiring moderation.</CardDescription>
            </div>
            <Badge variant="secondary" className="bg-amber-100 text-amber-700 hover:bg-amber-100 border-none">
              <AlertTriangle className="w-3.5 h-3.5 mr-1" /> High Priority
            </Badge>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[400px]">Question Text</TableHead>
                  <TableHead>Industry</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {PENDING_QUESTIONS.map((q) => (
                  <TableRow key={q.id}>
                    <TableCell className="font-medium text-slate-700 dark:text-slate-300 italic">"{q.text}"</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="font-bold">{q.industry}</Badge>
                    </TableCell>
                    <TableCell className="text-slate-400 text-xs">{q.generated_at}</TableCell>
                    <TableCell className="text-right flex justify-end gap-2">
                      <Button size="sm" variant="outline" className="h-8 border-emerald-200 text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700">
                        <CheckCircle2 className="w-4 h-4 mr-1" /> Approve
                      </Button>
                      <Button size="sm" variant="ghost" className="h-8 text-rose-600 hover:text-rose-700 hover:bg-rose-50 px-2">
                        <XCircle className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-slate-200">
          <CardHeader>
            <CardTitle className="text-xl">AI Model Registry</CardTitle>
            <CardDescription>Active models and cost metrics.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
             <div className="space-y-4">
               {[
                 { name: "GPT-4o", status: "Active", cost: "$0.01", health: 100 },
                 { name: "Gemini Pro", status: "Active", cost: "$0.005", health: 98 },
                 { name: "Llama 3 (Groq)", status: "Active", cost: "$0.001", health: 100 },
               ].map((model) => (
                 <div key={model.name} className="flex items-center justify-between p-3 border border-slate-100 rounded-lg hover:bg-slate-50 transition-colors">
                   <div className="space-y-1">
                     <p className="text-sm font-bold text-slate-900 dark:text-white">{model.name}</p>
                     <p className="text-[10px] text-slate-400 font-medium tracking-tighter uppercase">Cost: {model.cost} / 1k Tokens</p>
                   </div>
                   <div className="flex flex-col items-end gap-1">
                      <div className="flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
                        <span className="text-xs font-bold text-slate-600">{model.status}</span>
                      </div>
                      <div className="w-16 h-1 bg-slate-100 rounded-full overflow-hidden">
                        <div className="bg-emerald-500 h-full" style={{ width: `${model.health}%` }}></div>
                      </div>
                   </div>
                 </div>
               ))}
             </div>
             <Button className="w-full bg-slate-900 hover:bg-slate-800 text-white shadow-md">
               Manage Providers
             </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
