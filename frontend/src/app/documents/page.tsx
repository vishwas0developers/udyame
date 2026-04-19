"use client";

import React, { useState } from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  FileText, 
  Download, 
  Eye, 
  Search, 
  Filter, 
  MoreVertical, 
  Clock, 
  FileBarChart,
  HardDrive
} from "lucide-react";

interface Document {
  id: string;
  title: string;
  type: string;
  date: string;
  status: string;
  industry: string;
}

const DOCUMENTS: Document[] = [
  {
    id: "1",
    title: "EcoSmart Logistics - Phase 1 Plan",
    type: "Business Plan",
    date: "2024-03-24",
    status: "Completed",
    industry: "SaaS/Logistics",
  },
  {
    id: "2",
    title: "Market Analysis - Mumbai Region",
    type: "Report",
    date: "2024-04-10",
    status: "Draft",
    industry: "Retail",
  },
  {
    id: "3",
    title: "Financial Projections 2025",
    type: "Roadmap",
    date: "2024-04-15",
    status: "Completed",
    industry: "Fintech",
  },
];

export default function DocumentsPage() {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredDocs = DOCUMENTS.filter(doc => 
    doc.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    doc.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container mx-auto py-10 px-4 space-y-8 max-w-7xl">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-slate-900 dark:text-white">Document Library</h1>
          <p className="text-slate-500 mt-2 text-lg">Access and download your AI-generated business documents.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <Button variant="outline" className="hidden md:flex">
             <Filter className="w-4 h-4 mr-2" /> Filter
          </Button>
          <Button className="bg-indigo-600 hover:bg-indigo-700">
             <HardDrive className="w-4 h-4 mr-2" /> Sync Records
          </Button>
        </div>
      </div>

      <div className="flex items-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-1.5 shadow-sm max-w-md">
        <Search className="w-5 h-5 text-slate-400" />
        <Input 
          className="border-none focus-visible:ring-0 text-md bg-transparent" 
          placeholder="Search by title, industry or type..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDocs.map((doc) => (
          <Card key={doc.id} className="group hover:border-indigo-300 transition-all duration-300 shadow-sm hover:shadow-md h-[220px] flex flex-col">
            <CardHeader className="flex flex-row items-start justify-between pb-2">
              <div className="p-2 bg-indigo-50 dark:bg-indigo-950 rounded-lg text-indigo-600 dark:text-indigo-400 group-hover:bg-indigo-600 group-hover:text-white transition-colors duration-300">
                {doc.type === "Business Plan" ? <FileText className="w-6 h-6" /> : <FileBarChart className="w-6 h-6" />}
              </div>
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </CardHeader>
            <CardContent className="flex-grow">
              <CardTitle className="text-lg font-bold line-clamp-1">{doc.title}</CardTitle>
              <div className="flex items-center gap-3 mt-3">
                <Badge variant="outline" className="text-[10px] font-bold uppercase tracking-wider bg-slate-50">
                  {doc.type}
                </Badge>
                <Badge className={doc.status === "Completed" ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-none px-2 py-0 text-[10px]" : "bg-amber-100 text-amber-700 hover:bg-amber-100 border-none px-2 py-0 text-[10px]"}>
                  {doc.status}
                </Badge>
              </div>
              <p className="text-xs text-slate-400 mt-4 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" /> Updated on {doc.date}
              </p>
            </CardContent>
            <CardFooter className="bg-slate-50/50 dark:bg-slate-900/50 border-t py-3 flex gap-2">
              <Button variant="outline" size="sm" className="w-full text-xs font-semibold hover:bg-white border-slate-200">
                <Eye className="w-3.5 h-3.5 mr-2" /> Preview
              </Button>
              <Button variant="secondary" size="sm" className="w-full text-xs font-semibold bg-indigo-50 text-indigo-600 hover:bg-indigo-100 border-none">
                <Download className="w-3.5 h-3.5 mr-2" /> Export
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      {filteredDocs.length === 0 && (
         <div className="text-center py-20 border-2 border-dashed border-slate-200 rounded-2xl">
            <FileText className="w-16 h-16 text-slate-200 mx-auto" />
            <h3 className="text-xl font-bold mt-4 text-slate-800">No documents found</h3>
            <p className="text-slate-500 max-w-xs mx-auto mt-2">Try adjusting your search or generate a new business plan.</p>
         </div>
      )}
    </div>
  );
}
