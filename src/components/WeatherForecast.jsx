import React, { useState, useEffect } from 'react';
import { Cloud, Sun, CloudRain, CloudSnow, CloudLightning, Wind, Droplets, Thermometer, CloudFog, CloudSun } from 'lucide-react';

// Coordinates for Skogkrogen 8, 5683 Haarby, Denmark
const LATITUDE = 55.22;
const LONGITUDE = 10.05;

// Weather code to icon and description mapping (WMO Weather interpretation codes)
const weatherCodeMap = {
  0: { icon: Sun, description: 'Klart vejr', color: 'text-yellow-500' },
  1: { icon: Sun, description: 'Hovedsageligt klart', color: 'text-yellow-500' },
  2: { icon: CloudSun, description: 'Delvist skyet', color: 'text-gray-400' },
  3: { icon: Cloud, description: 'Overskyet', color: 'text-gray-500' },
  45: { icon: CloudFog, description: 'Tåge', color: 'text-gray-400' },
  48: { icon: CloudFog, description: 'Rimtåge', color: 'text-gray-400' },
  51: { icon: CloudRain, description: 'Let støvregn', color: 'text-blue-400' },
  53: { icon: CloudRain, description: 'Moderat støvregn', color: 'text-blue-500' },
  55: { icon: CloudRain, description: 'Tæt støvregn', color: 'text-blue-600' },
  56: { icon: CloudRain, description: 'Let isslag', color: 'text-cyan-400' },
  57: { icon: CloudRain, description: 'Tæt isslag', color: 'text-cyan-500' },
  61: { icon: CloudRain, description: 'Let regn', color: 'text-blue-400' },
  63: { icon: CloudRain, description: 'Moderat regn', color: 'text-blue-500' },
  65: { icon: CloudRain, description: 'Kraftig regn', color: 'text-blue-600' },
  66: { icon: CloudRain, description: 'Let isregn', color: 'text-cyan-400' },
  67: { icon: CloudRain, description: 'Kraftig isregn', color: 'text-cyan-500' },
  71: { icon: CloudSnow, description: 'Let sne', color: 'text-sky-300' },
  73: { icon: CloudSnow, description: 'Moderat sne', color: 'text-sky-400' },
  75: { icon: CloudSnow, description: 'Kraftig sne', color: 'text-sky-500' },
  77: { icon: CloudSnow, description: 'Snekorn', color: 'text-sky-300' },
  80: { icon: CloudRain, description: 'Lette byger', color: 'text-blue-400' },
  81: { icon: CloudRain, description: 'Moderate byger', color: 'text-blue-500' },
  82: { icon: CloudRain, description: 'Kraftige byger', color: 'text-blue-600' },
  85: { icon: CloudSnow, description: 'Lette snebyger', color: 'text-sky-300' },
  86: { icon: CloudSnow, description: 'Kraftige snebyger', color: 'text-sky-500' },
  95: { icon: CloudLightning, description: 'Tordenvejr', color: 'text-purple-500' },
  96: { icon: CloudLightning, description: 'Tordenvejr med hagl', color: 'text-purple-600' },
  99: { icon: CloudLightning, description: 'Tordenvejr med kraftig hagl', color: 'text-purple-700' },
};

const getWeatherInfo = (code) => {
  return weatherCodeMap[code] || { icon: Cloud, description: 'Ukendt', color: 'text-gray-400' };
};

const getDayName = (dateString) => {
  const date = new Date(dateString);
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  if (date.toDateString() === today.toDateString()) return 'I dag';
  if (date.toDateString() === tomorrow.toDateString()) return 'I morgen';
  
  const days = ['Søn', 'Man', 'Tir', 'Ons', 'Tor', 'Fre', 'Lør'];
  return days[date.getDay()];
};

const formatDate = (dateString) => {
  const date = new Date(dateString);
  const day = date.getDate();
  const months = ['jan', 'feb', 'mar', 'apr', 'maj', 'jun', 'jul', 'aug', 'sep', 'okt', 'nov', 'dec'];
  return `${day}. ${months[date.getMonth()]}`;
};

export function WeatherForecast() {
  const [forecast, setForecast] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const response = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${LATITUDE}&longitude=${LONGITUDE}&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max,wind_speed_10m_max&timezone=Europe%2FCopenhagen`
        );
        
        if (!response.ok) throw new Error('Kunne ikke hente vejrdata');
        
        const data = await response.json();
        setForecast(data.daily);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchWeather();
  }, []);

  if (loading) {
    return (
      <div className="bg-canvas-default border border-border-default rounded-lg shadow-sm overflow-hidden">
        <div className="border-b border-border-muted px-3 sm:px-4 lg:px-6 py-3 sm:py-4">
          <h2 className="text-base sm:text-lg font-semibold text-fg-default">Vejrudsigt</h2>
        </div>
        <div className="p-4 sm:p-6 flex items-center justify-center">
          <div className="animate-pulse flex space-x-4">
            <div className="flex-1 space-y-4 py-1">
              <div className="h-4 bg-canvas-subtle rounded w-3/4"></div>
              <div className="space-y-2">
                <div className="h-4 bg-canvas-subtle rounded"></div>
                <div className="h-4 bg-canvas-subtle rounded w-5/6"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-canvas-default border border-border-default rounded-lg shadow-sm overflow-hidden">
        <div className="border-b border-border-muted px-3 sm:px-4 lg:px-6 py-3 sm:py-4">
          <h2 className="text-base sm:text-lg font-semibold text-fg-default">Vejrudsigt</h2>
        </div>
        <div className="p-4 sm:p-6">
          <p className="text-sm text-danger-fg">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-canvas-default border border-border-default rounded-lg shadow-sm overflow-hidden">
      <div className="border-b border-border-muted px-3 sm:px-4 lg:px-6 py-3 sm:py-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base sm:text-lg font-semibold text-fg-default">Vejrudsigt for Skovkrogen</h2>
          <span className="text-xs text-fg-muted">Haarby, Danmark</span>
        </div>
      </div>
      <div className="p-3 sm:p-4 lg:p-6">
        <div className="grid grid-cols-7 gap-1 sm:gap-2 lg:gap-3">
          {forecast.time.slice(0, 7).map((date, index) => {
            const weatherInfo = getWeatherInfo(forecast.weather_code[index]);
            const WeatherIcon = weatherInfo.icon;
            
            return (
              <div 
                key={date} 
                className={`flex flex-col items-center p-2 sm:p-3 rounded-lg transition-colors ${
                  index === 0 ? 'bg-accent-fg/10 ring-1 ring-accent-fg/20' : 'hover:bg-canvas-subtle'
                }`}
              >
                <span className="text-xs sm:text-sm font-medium text-fg-default">
                  {getDayName(date)}
                </span>
                <span className="text-[10px] sm:text-xs text-fg-muted mb-1 sm:mb-2">
                  {formatDate(date)}
                </span>
                
                <WeatherIcon className={`h-6 w-6 sm:h-8 sm:w-8 ${weatherInfo.color} mb-1 sm:mb-2`} />
                
                <span className="text-[10px] sm:text-xs text-fg-muted text-center leading-tight mb-1 sm:mb-2 h-6 sm:h-8 flex items-center">
                  {weatherInfo.description}
                </span>
                
                <div className="flex items-center space-x-1 text-xs sm:text-sm">
                  <span className="font-semibold text-fg-default">
                    {Math.round(forecast.temperature_2m_max[index])}°
                  </span>
                  <span className="text-fg-muted">/</span>
                  <span className="text-fg-muted">
                    {Math.round(forecast.temperature_2m_min[index])}°
                  </span>
                </div>
                
                <div className="flex items-center mt-1 sm:mt-2 text-[10px] sm:text-xs text-fg-muted">
                  <Droplets className="h-3 w-3 mr-0.5" />
                  <span>{forecast.precipitation_probability_max[index]}%</span>
                </div>
              </div>
            );
          })}
        </div>
        
        {/* Today's detailed info */}
        <div className="mt-4 pt-4 border-t border-border-muted">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="flex flex-col items-center">
              <div className="flex items-center text-fg-muted mb-1">
                <Thermometer className="h-4 w-4 mr-1" />
                <span className="text-xs">Temperatur</span>
              </div>
              <span className="text-sm font-medium text-fg-default">
                {Math.round(forecast.temperature_2m_min[0])}° - {Math.round(forecast.temperature_2m_max[0])}°
              </span>
            </div>
            <div className="flex flex-col items-center">
              <div className="flex items-center text-fg-muted mb-1">
                <CloudRain className="h-4 w-4 mr-1" />
                <span className="text-xs">Nedbør</span>
              </div>
              <span className="text-sm font-medium text-fg-default">
                {forecast.precipitation_sum[0]} mm
              </span>
            </div>
            <div className="flex flex-col items-center">
              <div className="flex items-center text-fg-muted mb-1">
                <Wind className="h-4 w-4 mr-1" />
                <span className="text-xs">Vind</span>
              </div>
              <span className="text-sm font-medium text-fg-default">
                {Math.round(forecast.wind_speed_10m_max[0])} km/t
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
