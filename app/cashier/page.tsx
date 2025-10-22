'use client';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import DirectOrder from '@/app/cashier/DirectOrder/page'; 
import OrderQueue from '@/app/cashier/OrderQueue/page';

export default function CashierPage() {
  const [activeTab, setActiveTab] = useState('direct');

  return (
    <div className="max-w-7xl mx-auto">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2 mb-6">
          <TabsTrigger value="direct">Order Baru</TabsTrigger>
          <TabsTrigger value="queue">Antrian Order</TabsTrigger>
        </TabsList>

        <TabsContent value="direct">
          <DirectOrder />
        </TabsContent>

        <TabsContent value="queue">
          <OrderQueue />
        </TabsContent>
      </Tabs>
    </div>
  );
}