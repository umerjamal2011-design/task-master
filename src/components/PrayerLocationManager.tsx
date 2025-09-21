import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent } from '@/components/ui/card';
import { LocationData, PrayerSettings } from '@/types';
import { MapPin, Compass, Clock, Warning } from '@phosphor-icons/react';

interface PrayerLocationManagerProps {
  prayerSettings: PrayerSettings;
  onUpdatePrayerSettings: (settings: PrayerSettings) => void;
  isUpdating: boolean;
}

export function PrayerLocationManager({
  prayerSettings,
  onUpdatePrayerSettings,
  isUpdating
}: PrayerLocationManagerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [customLocation, setCustomLocation] = useState<Partial<LocationData>>({
    city: prayerSettings.location?.city || '',
    country: prayerSettings.location?.country || '',
    latitude: prayerSettings.location?.latitude || 0,
    longitude: prayerSettings.location?.longitude || 0,
    timezone: prayerSettings.location?.timezone || 'UTC'
  });
  const [calculationMethod, setCalculationMethod] = useState(prayerSettings.method?.toString() || '2');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<LocationData[]>([]);

  const calculationMethods = [
    { value: '1', label: 'University of Islamic Sciences, Karachi' },
    { value: '2', label: 'Islamic Society of North America (ISNA)' },
    { value: '3', label: 'Muslim World League' },
    { value: '4', label: 'Umm Al-Qura University, Makkah' },
    { value: '5', label: 'Egyptian General Authority of Survey' },
    { value: '7', label: 'Institute of Geophysics, University of Tehran' },
    { value: '8', label: 'Gulf Region' },
    { value: '9', label: 'Kuwait' },
    { value: '10', label: 'Qatar' },
    { value: '11', label: 'Majlis Ugama Islam Singapura, Singapore' },
    { value: '12', label: 'Union Organization islamic de France' },
    { value: '13', label: 'Diyanet İşleri Başkanlığı, Turkey' }
  ];

  // Search for location using OpenStreetMap Nominatim API
  const searchLocation = async (query: string) => {
    if (!query.trim() || query.length < 3) return;
    
    setIsSearching(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&addressdetails=1`
      );
      
      if (response.ok) {
        const data = await response.json();
        const locations: LocationData[] = data.map((item: any) => ({
          city: item.address?.city || item.address?.town || item.address?.village || item.display_name.split(',')[0],
          country: item.address?.country || 'Unknown',
          latitude: parseFloat(item.lat),
          longitude: parseFloat(item.lon),
          timezone: 'UTC' // We'll need to determine timezone separately
        }));
        setSearchResults(locations);
      }
    } catch (error) {
      console.error('Location search failed:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by this browser');
      return;
    }

    setIsSearching(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        
        try {
          // Reverse geocode to get city/country
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1`
          );
          
          if (response.ok) {
            const data = await response.json();
            const location: LocationData = {
              city: data.address?.city || data.address?.town || data.address?.village || 'Current Location',
              country: data.address?.country || 'Unknown',
              latitude,
              longitude,
              timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
            };
            
            setCustomLocation(location);
          }
        } catch (error) {
          console.error('Reverse geocoding failed:', error);
          setCustomLocation({
            city: 'Current Location',
            country: 'Unknown',
            latitude,
            longitude,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
          });
        } finally {
          setIsSearching(false);
        }
      },
      (error) => {
        console.error('Geolocation failed:', error);
        setIsSearching(false);
        alert('Unable to get your current location');
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  const handleSave = async () => {
    if (!customLocation.city || !customLocation.latitude || !customLocation.longitude) {
      alert('Please select a valid location');
      return;
    }

    try {
      const updatedSettings: PrayerSettings = {
        ...prayerSettings,
        enabled: true,
        location: customLocation as LocationData,
        method: parseInt(calculationMethod),
        lastUpdated: new Date().toISOString()
      };

      await onUpdatePrayerSettings(updatedSettings);
      setIsOpen(false);
    } catch (error) {
      console.error('Failed to update prayer settings:', error);
      alert('Failed to update prayer settings. Please try again.');
    }
  };

  const handleLocationSelect = (location: LocationData) => {
    setCustomLocation(location);
    setSearchResults([]);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          className="w-full gap-2 text-sm"
          disabled={isUpdating}
        >
          <MapPin size={16} />
          {prayerSettings.location ? 'Change Location' : 'Set Location'}
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Compass size={20} />
            Prayer Location Settings
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Warning Alert */}
          <Alert className="border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950">
            <Warning size={16} className="text-amber-600" />
            <AlertDescription className="text-amber-800 dark:text-amber-200">
              Prayer times automatically update daily based on your selected location. Changing location will update all future prayer timings.
            </AlertDescription>
          </Alert>

          {/* Current Location Display */}
          {prayerSettings.location && (
            <Card className="bg-muted/50">
              <CardContent className="pt-4">
                <div className="flex items-center gap-2 mb-2">
                  <MapPin size={16} className="text-muted-foreground" />
                  <span className="text-sm font-medium">Current Location</span>
                </div>
                <div className="text-sm text-foreground">
                  {prayerSettings.location.city}, {prayerSettings.location.country}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  {prayerSettings.location.latitude.toFixed(4)}, {prayerSettings.location.longitude.toFixed(4)}
                </div>
                {prayerSettings.lastUpdated && (
                  <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                    <Clock size={12} />
                    Updated: {new Date(prayerSettings.lastUpdated).toLocaleDateString()}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Location Search */}
          <div className="space-y-2">
            <Label htmlFor="location-search">Search Location</Label>
            <div className="flex gap-2">
              <Input
                id="location-search"
                placeholder="Enter city name..."
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    searchLocation(e.currentTarget.value);
                  }
                }}
              />
              <Button
                variant="outline"
                onClick={getCurrentLocation}
                disabled={isSearching}
                title="Use current location"
              >
                <Compass size={16} />
              </Button>
            </div>
            
            {/* Search Results */}
            {searchResults.length > 0 && (
              <div className="space-y-1 max-h-32 overflow-y-auto border rounded-md p-2">
                {searchResults.map((location, index) => (
                  <button
                    key={index}
                    onClick={() => handleLocationSelect(location)}
                    className="w-full text-left p-2 text-sm hover:bg-muted rounded-sm transition-colors"
                  >
                    <div className="font-medium">{location.city}</div>
                    <div className="text-muted-foreground text-xs">
                      {location.country} • {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Manual Coordinates */}
          <div className="space-y-3">
            <Label>Manual Location Entry</Label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="city" className="text-xs">City</Label>
                <Input
                  id="city"
                  value={customLocation.city || ''}
                  onChange={(e) => setCustomLocation(prev => ({ ...prev, city: e.target.value }))}
                  placeholder="City name"
                />
              </div>
              <div>
                <Label htmlFor="country" className="text-xs">Country</Label>
                <Input
                  id="country"
                  value={customLocation.country || ''}
                  onChange={(e) => setCustomLocation(prev => ({ ...prev, country: e.target.value }))}
                  placeholder="Country name"
                />
              </div>
              <div>
                <Label htmlFor="latitude" className="text-xs">Latitude</Label>
                <Input
                  id="latitude"
                  type="number"
                  step="any"
                  value={customLocation.latitude || ''}
                  onChange={(e) => setCustomLocation(prev => ({ ...prev, latitude: parseFloat(e.target.value) || 0 }))}
                  placeholder="0.0000"
                />
              </div>
              <div>
                <Label htmlFor="longitude" className="text-xs">Longitude</Label>
                <Input
                  id="longitude"
                  type="number"
                  step="any"
                  value={customLocation.longitude || ''}
                  onChange={(e) => setCustomLocation(prev => ({ ...prev, longitude: parseFloat(e.target.value) || 0 }))}
                  placeholder="0.0000"
                />
              </div>
            </div>
          </div>

          {/* Calculation Method */}
          <div className="space-y-2">
            <Label>Calculation Method</Label>
            <Select value={calculationMethod} onValueChange={setCalculationMethod}>
              <SelectTrigger>
                <SelectValue placeholder="Select calculation method" />
              </SelectTrigger>
              <SelectContent>
                {calculationMethods.map((method) => (
                  <SelectItem key={method.value} value={method.value}>
                    {method.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 pt-4">
          <Button
            onClick={() => setIsOpen(false)}
            variant="outline"
            className="w-full sm:w-auto"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={isUpdating || !customLocation.city || !customLocation.latitude}
            className="w-full sm:w-auto"
          >
            {isUpdating ? 'Updating...' : 'Save & Update Times'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}