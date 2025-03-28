'use client';

import { useState } from 'react';
import { Button } from '../../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Loader2, RefreshCw, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';

export default function FetchDataPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isClearingData, setIsClearingData] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const router = useRouter();
  const { data: session } = useSession();

  // Redirect if not admin
  if (session?.user?.email !== 'justinbillson@gmail.com') {
    router.push('/');
    return null;
  }

  const handleFetchData = async (shopName: string) => {
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch('/api/products/fetch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ shopName }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch data');
      }

      const data = await response.json();
      toast.success(`Successfully fetched ${data.processed} products from ${shopName}`);
      setSuccess(`Successfully fetched ${data.processed} products from ${shopName}`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      toast.error(errorMessage);
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearData = async (shopName: string) => {
    // Confirm with the user
    if (!window.confirm(`Are you sure you want to delete all products for ${shopName}? This action cannot be undone.`)) {
      return;
    }

    setIsClearingData(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch('/api/products/clear', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ shopName }),
      });

      if (!response.ok) {
        throw new Error('Failed to clear data');
      }

      const data = await response.json();
      toast.success(`Successfully cleared ${data.deleted} products from ${shopName}`);
      setSuccess(`Successfully cleared ${data.deleted} products from ${shopName}`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      toast.error(errorMessage);
      setError(errorMessage);
    } finally {
      setIsClearingData(false);
    }
  };

  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>Fetch Shop Data</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-medium mb-4">Available Shops</h3>
              <div className="space-y-4">
                <div className="flex flex-col md:flex-row gap-2">
                  <Button
                    onClick={() => handleFetchData('Woolworths')}
                    disabled={isLoading || isClearingData}
                    className="flex-1"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Fetching...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Fetch Woolworths Data
                      </>
                    )}
                  </Button>
                  <Button
                    onClick={() => handleClearData('Woolworths')}
                    disabled={isLoading || isClearingData}
                    variant="destructive"
                  >
                    {isClearingData ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Clearing...
                      </>
                    ) : (
                      <>
                        <Trash2 className="mr-2 h-4 w-4" />
                        Clear Woolworths Data
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 text-red-500 p-4 rounded-md">
                {error}
              </div>
            )}

            {success && (
              <div className="bg-green-50 text-green-500 p-4 rounded-md">
                {success}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 