import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Package, AlertTriangle, DollarSign, ArrowRight, TrendingDown, TrendingUp, RefreshCw, RotateCcw, SlidersHorizontal } from 'lucide-react';
import dayjs from 'dayjs';
import api from '../../lib/axios';

const TYPE_CFG = {
  purchase:       { label: 'Purchase',      color: 'text-emerald-600 bg-emerald-50', Icon: TrendingUp     },
  issue:          { label: 'Issue',         color: 'text-red-600    bg-red-50',      Icon: TrendingDown   },
  return:         { label: 'Return',        color: 'text-blue-600   bg-blue-50',     Icon: RotateCcw      },
  adjustment_in:  { label: 'Adj. In',       color: 'text-teal-600   bg-teal-50',     Icon: RefreshCw      },
  adjustment_out: { label: 'Adj. Out',      color: 'text-orange-600 bg-orange-50',   Icon: SlidersHorizontal },
};

const CAT_COLORS = ['bg-primary-100 text-primary-700','bg-amber-100 text-amber-700','bg-emerald-100 text-emerald-700',
  'bg-pink-100 text-pink-700','bg-purple-100 text-purple-700','bg-teal-100 text-teal-700'];

export default function InventoryDashboard() {
  const navigate = useNavigate();

  const { data, isLoading } = useQuery({
    queryKey: ['inventory-dashboard'],
    queryFn:  () => api.get('/inventory/dashboard').then(r => r.data.data),
    staleTime: 60_000,
  });

  const kpis = [
    { label: 'Total Items',  value: data?.totalItems   ?? 0, sub: 'catalog items',      icon: Package,       color: 'bg-primary-50 text-primary-600' },
    { label: 'Low Stock',    value: data?.lowStockCount?? 0, sub: 'items need restocking',icon: AlertTriangle, color: 'bg-amber-50 text-amber-600'    },
    { label: 'Out of Stock', value: data?.outOfStock   ?? 0, sub: 'items at zero',       icon: AlertTriangle, color: 'bg-red-50 text-red-600'         },
    { label: 'Total Value',  value: data?.totalValue != null ? `₹${Math.round(data.totalValue).toLocaleString()}` : '₹0', sub: 'inventory worth', icon: DollarSign, color: 'bg-emerald-50 text-emerald-600' },
  ];

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <h1 className="page-title">Inventory</h1>
          <p className="page-subtitle">Stock management and movement tracking</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => navigate('/inventory/movements')} className="btn btn-ghost btn-md">Stock Movements</button>
          <button onClick={() => navigate('/inventory/items')} className="btn btn-primary btn-md">
            <Package size={15}/> Manage Items
          </button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map(k => (
          <div key={k.label} className="card card-body">
            {isLoading
              ? <div className="skeleton h-16 rounded-lg"/>
              : (
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${k.color}`}>
                    <k.icon size={18}/>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-slate-800">{k.value}</p>
                    <p className="text-xs text-slate-500">{k.label}</p>
                    <p className="text-xs text-slate-400">{k.sub}</p>
                  </div>
                </div>
              )
            }
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        {/* Low stock alerts */}
        <div className="card lg:col-span-2">
          <div className="card-body border-b border-slate-100 flex items-center justify-between py-3">
            <div className="flex items-center gap-2">
              <AlertTriangle size={15} className="text-amber-500"/>
              <p className="font-semibold text-sm text-slate-700">Low Stock Alerts</p>
            </div>
            <button onClick={() => navigate('/inventory/items?lowStock=true')} className="text-xs text-primary-600 hover:underline">View all</button>
          </div>
          {isLoading
            ? <div className="card-body space-y-2">{Array.from({length:5}).map((_,i) => <div key={i} className="skeleton h-10 rounded"/>)}</div>
            : !data?.lowStockItems?.length
              ? <div className="card-body text-center py-8 text-slate-400 text-sm">All items are well-stocked</div>
              : (
                <div className="divide-y divide-slate-100">
                  {data.lowStockItems.map(item => {
                    const pct = item.minStock > 0 ? Math.round((item.currentStock / item.minStock) * 100) : 0;
                    const clr = item.currentStock === 0 ? 'bg-red-500' : 'bg-amber-400';
                    return (
                      <div key={item._id} className="flex items-center gap-3 px-4 py-3">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-slate-700 truncate">{item.name}</p>
                          <p className="text-xs text-slate-400 capitalize">{item.category} · {item.location || 'No location'}</p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className={`text-sm font-bold ${item.currentStock === 0 ? 'text-red-600' : 'text-amber-600'}`}>
                            {item.currentStock} <span className="text-xs font-normal text-slate-400">{item.unit}</span>
                          </p>
                          <p className="text-xs text-slate-400">min: {item.minStock}</p>
                        </div>
                        <div className="w-16">
                          <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div className={`h-full rounded-full ${clr}`} style={{ width: `${Math.min(pct,100)}%` }}/>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )
          }
        </div>

        {/* Category breakdown */}
        <div className="card card-body space-y-3">
          <p className="font-semibold text-sm text-slate-700">By Category</p>
          {isLoading
            ? Array.from({length:5}).map((_,i) => <div key={i} className="skeleton h-8 rounded"/>)
            : data?.categoryStats?.map((cat, i) => (
              <div key={cat._id} className="flex items-center gap-2">
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${CAT_COLORS[i % CAT_COLORS.length]}`}>{cat._id}</span>
                <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-primary-400 rounded-full" style={{ width: `${Math.min(Math.round((cat.count / (data?.totalItems||1)) * 100),100)}%`}}/>
                </div>
                <span className="text-xs text-slate-500 w-8 text-right">{cat.count}</span>
              </div>
            ))
          }
        </div>
      </div>

      {/* Recent movements */}
      <div className="card overflow-hidden">
        <div className="card-body border-b border-slate-100 flex items-center justify-between py-3">
          <p className="font-semibold text-sm text-slate-700">Recent Movements</p>
          <button onClick={() => navigate('/inventory/movements')} className="flex items-center gap-1 text-xs text-primary-600 hover:underline">
            All movements <ArrowRight size={11}/>
          </button>
        </div>
        {isLoading
          ? <div className="card-body space-y-2">{Array.from({length:5}).map((_,i) => <div key={i} className="skeleton h-12 rounded"/>)}</div>
          : !data?.recentMovements?.length
            ? <div className="card-body text-center py-8 text-slate-400 text-sm">No movements recorded yet.</div>
            : (
              <div className="divide-y divide-slate-100">
                {data.recentMovements.map(m => {
                  const cfg = TYPE_CFG[m.type] ?? TYPE_CFG.purchase;
                  const isOut = ['issue','adjustment_out'].includes(m.type);
                  return (
                    <div key={m._id} className="flex items-center gap-3 px-4 py-3">
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${cfg.color}`}>
                        <cfg.Icon size={13}/>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-700">{m.itemId?.name}</p>
                        <p className="text-xs text-slate-400">{cfg.label} · {dayjs(m.movedAt).format('DD MMM HH:mm')}</p>
                      </div>
                      <div className="text-right">
                        <p className={`text-sm font-bold ${isOut ? 'text-red-600' : 'text-emerald-600'}`}>
                          {isOut ? '-' : '+'}{m.quantity} <span className="text-xs font-normal text-slate-400">{m.itemId?.unit}</span>
                        </p>
                        <p className="text-xs text-slate-400">→ {m.stockAfter} left</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )
        }
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {[
          { label: 'Item Catalog',      sub: 'Add, edit and manage items', href: '/inventory/items',     color: 'border-primary-200 hover:bg-primary-50' },
          { label: 'Stock Movements',   sub: 'Purchase, issue, adjust',     href: '/inventory/movements', color: 'border-slate-200 hover:bg-slate-50'     },
        ].map(a => (
          <button key={a.href} onClick={() => navigate(a.href)}
            className={`card card-body flex items-center justify-between text-left border-2 transition-colors ${a.color}`}>
            <div>
              <p className="font-semibold text-slate-800">{a.label}</p>
              <p className="text-xs text-slate-500">{a.sub}</p>
            </div>
            <ArrowRight size={16} className="text-slate-400 shrink-0"/>
          </button>
        ))}
      </div>
    </div>
  );
}
