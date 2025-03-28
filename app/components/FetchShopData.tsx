'use client';

import { useState } from 'react';
import { Button } from '../../components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { toast } from 'sonner';

const SUPPORTED_SHOPS = [
  { name: 'Woolworths', value: 'woolworths' },
  // Add Pick n Pay when implemented
];

export function FetchShopData() {
  const [selectedShop, setSelectedShop] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const handleFetchData = async () => {
    if (!selectedShop) {
      toast.error('Please select a shop');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/products/fetch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ shopName: selectedShop }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch data');
      }

      const data = await response.json();
      toast.success(data.message);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to fetch data from shop');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-4 p-4 border rounded-lg">
      <h2 className="text-lg font-semibold">Fetch Latest Shop Data</h2>
      <div className="flex gap-4">
        <Select value={selectedShop} onValueChange={setSelectedShop}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Select a shop" />
          </SelectTrigger>
          <SelectContent>
            {SUPPORTED_SHOPS.map((shop) => (
              <SelectItem key={shop.value} value={shop.value}>
                {shop.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button onClick={handleFetchData} disabled={isLoading}>
          {isLoading ? 'Fetching...' : 'Fetch Latest Data'}
        </Button>
      </div>
    </div>
  );
} 