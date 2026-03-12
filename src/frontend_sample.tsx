import React from 'react';
import { Card } from './components/ui/card';
import { Button } from './components/ui/button';
import { Badge } from './components/ui/badge';

/**
 * Frontend Sample Reference
 * This file demonstrates the core design language used in OmniProcure.
 * Characteristics: Sleek dark mode, glassmorphism, accent borders, and premium typography.
 */

export const ProcurementSample = () => {
  return (
    <div className="p-8 bg-slate-950 min-h-screen text-slate-100 font-sans">
      <header className="mb-12">
        <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
          OmniProcure Design System
        </h1>
        <p className="text-slate-400 mt-2 text-lg">Autonomous Procurement Reference Components</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Status Card Sample */}
        <Card className="p-6 bg-slate-900/50 border-slate-800 backdrop-blur-xl border-l-4 border-l-blue-500 shadow-2xl">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-xl font-semibold">Orchestrator Status</h3>
              <p className="text-sm text-slate-500">Job ID: op-7742-v3</p>
            </div>
            <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">RUNNING</Badge>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
              <span className="text-sm">Multi-agent team initializing...</span>
            </div>
          </div>
        </Card>

        {/* PO Draft Sample */}
        <Card className="p-6 bg-slate-900/50 border-slate-800 backdrop-blur-xl shadow-xl">
          <h3 className="text-lg font-medium mb-4 text-slate-300 uppercase tracking-wider">Draft PO Details</h3>
          <div className="space-y-3">
            <div className="flex justify-between border-b border-slate-800 pb-2">
              <span className="text-slate-500">Item</span>
              <span className="font-semibold text-blue-400 italic">Industrial Safety Gloves</span>
            </div>
            <div className="flex justify-between border-b border-slate-800 pb-2">
              <span className="text-slate-500">Quantity</span>
              <span className="font-mono text-slate-200">3 Units</span>
            </div>
            <div className="flex justify-between border-b border-slate-800 pb-2">
              <span className="text-slate-500">Unit Price</span>
              <span className="font-mono text-green-400 text-lg">$18.00</span>
            </div>
            <div className="flex justify-between pt-2">
              <span className="text-slate-500 font-bold">Total</span>
              <span className="text-2xl font-bold text-slate-100">$54.00</span>
            </div>
          </div>
          
          <div className="mt-8 flex gap-4">
            <Button variant="outline" className="flex-1 border-slate-700 hover:bg-slate-800">Reject</Button>
            <Button className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:opacity-90 shadow-lg shadow-blue-500/20">
              Approve Order
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default ProcurementSample;
