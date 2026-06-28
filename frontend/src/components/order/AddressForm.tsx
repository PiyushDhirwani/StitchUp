import { MapPin, Loader2, Phone, Mail } from 'lucide-react';
import { LocateFixed } from 'lucide-react';
import type { DeliveryAddress } from '@/types/order.types';
import type { GeoStatus, GeoLocation } from '@/hooks/useGeolocation';

interface AddressFormProps {
  address: DeliveryAddress;
  setAddr: (key: keyof DeliveryAddress, value: string) => void;
  contactPhone: string;
  setContactPhone: (v: string) => void;
  contactEmail: string;
  setContactEmail: (v: string) => void;
  pincodeLoading: boolean;
  pincodeDistrict: string;
  reverseGeoLoading: boolean;
  geoStatus: GeoStatus;
  geoLocation: GeoLocation | null;
  onRequestLocation: () => void;
}

export function AddressForm({
  address,
  setAddr,
  contactPhone,
  setContactPhone,
  contactEmail,
  setContactEmail,
  pincodeLoading,
  pincodeDistrict,
  reverseGeoLoading,
  geoStatus,
  geoLocation,
  onRequestLocation,
}: AddressFormProps) {
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <MapPin size={16} className="text-teal-600" />
          <h2 className="text-lg font-semibold text-gray-800">Delivery Address & Contact</h2>
        </div>
        {geoStatus === 'idle' && (
          <button
            type="button"
            onClick={onRequestLocation}
            className="flex items-center gap-1 text-xs font-medium text-teal-700 bg-teal-50 hover:bg-teal-100 px-3 py-1.5 rounded-lg transition-colors"
          >
            <LocateFixed size={12} /> Auto-detect
          </button>
        )}
        {geoStatus === 'loading' && (
          <span className="flex items-center gap-1 text-xs text-gray-400">
            <Loader2 size={12} className="animate-spin" /> Detecting...
          </span>
        )}
        {reverseGeoLoading && (
          <span className="flex items-center gap-1 text-xs text-gray-400">
            <Loader2 size={12} className="animate-spin" /> Fetching address...
          </span>
        )}
      </div>

      {geoStatus === 'granted' && geoLocation && (
        <div className="grid grid-cols-3 gap-2 mb-4">
          <div className="bg-white rounded-lg border border-gray-100 px-3 py-2">
            <p className="text-[10px] uppercase text-gray-400 font-medium">Lat</p>
            <p className="text-xs text-gray-800 font-mono">{geoLocation.latitude.toFixed(6)}</p>
          </div>
          <div className="bg-white rounded-lg border border-gray-100 px-3 py-2">
            <p className="text-[10px] uppercase text-gray-400 font-medium">Lng</p>
            <p className="text-xs text-gray-800 font-mono">{geoLocation.longitude.toFixed(6)}</p>
          </div>
          <div className="bg-teal-50 rounded-lg border border-teal-200 px-3 py-2">
            <p className="text-[10px] uppercase text-teal-600 font-medium">DigiPIN</p>
            <p className="text-xs text-teal-800 font-semibold font-mono">{geoLocation.digipin}</p>
          </div>
        </div>
      )}

      <div className="space-y-3">
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Flat / House No. <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={address.flat_number}
              onChange={(e) => setAddr('flat_number', e.target.value)}
              placeholder="A-201"
              className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent"
            />
          </div>
          <div className="col-span-2">
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Street / Locality <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={address.address_line1}
              onChange={(e) => setAddr('address_line1', e.target.value)}
              placeholder="MG Road, Andheri West"
              className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent"
            />
          </div>
        </div>
        <div>
          <div className="relative">
            <label className="block text-xs font-medium text-gray-600 mb-1">
              PIN Code <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={address.postal_code}
              onChange={(e) => setAddr('postal_code', e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="400001"
              maxLength={6}
              className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent"
            />
            {pincodeLoading && <Loader2 size={14} className="absolute right-3 top-8 animate-spin text-teal-500" />}
          </div>
          {pincodeDistrict && (
            <p className="text-xs text-teal-600 mt-1 flex items-center gap-1"><MapPin size={10} /> {pincodeDistrict}</p>
          )}
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">City <span className="text-red-400">*</span></label>
            <input
              type="text"
              value={address.city}
              onChange={(e) => setAddr('city', e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">State <span className="text-red-400">*</span></label>
            <input
              type="text"
              value={address.state}
              onChange={(e) => setAddr('state', e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent"
            />
          </div>
        </div>

        {/* Contact */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1 flex items-center gap-1">
              <Phone size={11} /> Phone <span className="text-red-400">*</span>
            </label>
            <input
              type="tel"
              value={contactPhone}
              onChange={(e) => setContactPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
              placeholder="9876543210"
              maxLength={10}
              className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1 flex items-center gap-1">
              <Mail size={11} /> Email <span className="text-red-400">*</span>
            </label>
            <input
              type="email"
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
              placeholder="you@email.com"
              className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
