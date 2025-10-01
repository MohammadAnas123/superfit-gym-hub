// components/AddPurchaseModal.tsx
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/lib/supabaseClient';
import { useToast } from '@/hooks/use-toast';
import { Plus, Package } from 'lucide-react';

interface PackageType {
  package_id: string;
  package_name: string;
  duration_days: number;
  price: number;
  description: string;
}

interface AddPurchaseProps {
  userId: string;
  userName: string;
  onPurchaseAdded?: () => void;
}

const AddPurchaseModal = ({ userId, userName, onPurchaseAdded }: AddPurchaseProps) => {
  const [open, setOpen] = useState(false);
  const [packages, setPackages] = useState<PackageType[]>([]);
  const [selectedPackage, setSelectedPackage] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [transactionId, setTransactionId] = useState('');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      fetchPackages();
    }
  }, [open]);

  const fetchPackages = async () => {
    const { data, error } = await supabase
      .from('packages')
      .select('*')
      .eq('is_active', true)
      .order('duration_days', { ascending: true });

    if (!error && data) {
      setPackages(data);
    }
  };

  const handleAddPurchase = async () => {
    if (!selectedPackage) return;
    
    setLoading(true);
    const selectedPkg = packages.find(p => p.package_id === selectedPackage);
    if (!selectedPkg) return;

    const start = new Date(startDate);
    const end = new Date(start);
    end.setDate(end.getDate() + selectedPkg.duration_days);

    const { error } = await supabase.from('user_purchases').insert([{
      user_id: userId,
      package_id: selectedPkg.package_id,
      package_name: selectedPkg.package_name,
      amount: selectedPkg.price,
      duration_days: selectedPkg.duration_days,
      start_date: startDate,
      end_date: end.toISOString().split('T')[0],
      payment_status: 'completed',
      payment_method: paymentMethod,
      transaction_id: transactionId || null,
    }]);

    setLoading(false);

    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Success', description: `Package added for ${userName}` });
      setOpen(false);
      if (onPurchaseAdded) onPurchaseAdded();
    }
  };

  const selectedPkg = packages.find(p => p.package_id === selectedPackage);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="bg-blue-500 hover:bg-blue-600">
          <Plus size={16} className="mr-1" />
          Add Purchase
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Package className="mr-2" size={20} />
            Add Package for {userName}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Package</label>
            <Select value={selectedPackage} onValueChange={setSelectedPackage}>
              <SelectTrigger>
                <SelectValue placeholder="Choose package" />
              </SelectTrigger>
              <SelectContent>
                {packages.map((pkg) => (
                  <SelectItem key={pkg.package_id} value={pkg.package_id}>
                    {pkg.package_name} - ₹{pkg.price} ({pkg.duration_days} days)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedPkg && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="font-semibold">{selectedPkg.package_name}</div>
              <div className="text-sm mt-1">{selectedPkg.description}</div>
              <div className="flex justify-between text-sm mt-2">
                <span>Duration: {selectedPkg.duration_days} days</span>
                <span className="font-bold">₹{selectedPkg.price}</span>
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-2">Start Date</label>
            <Input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Payment Method</label>
            <Select value={paymentMethod} onValueChange={setPaymentMethod}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cash">Cash</SelectItem>
                <SelectItem value="upi">UPI</SelectItem>
                <SelectItem value="card">Card</SelectItem>
                <SelectItem value="online">Online</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {paymentMethod !== 'cash' && (
            <div>
              <label className="block text-sm font-medium mb-2">Transaction ID</label>
              <Input
                placeholder="Enter transaction ID"
                value={transactionId}
                onChange={(e) => setTransactionId(e.target.value)}
              />
            </div>
          )}

          <div className="flex gap-2 pt-4">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button
              className="flex-1 bg-green-500 hover:bg-green-600"
              onClick={handleAddPurchase}
              disabled={loading || !selectedPackage}
            >
              {loading ? 'Adding...' : 'Add Purchase'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddPurchaseModal;