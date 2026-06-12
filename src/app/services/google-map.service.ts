// src/app/services/google-maps.service.ts
/// <reference types="google.maps" />
import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class GoogleMapsService {
  private isLoaded = false;

  async load(): Promise<void> {
    if (this.isLoaded || (typeof google !== 'undefined' && google.maps)) {
      return;
    }

    await new Promise<void>((resolve, reject) => {
      const script = document.createElement('script');
      script.src =
        'https://maps.googleapis.com/maps/api/js?key=YOUR_API_KEY&libraries=places';
      script.async = true;
      script.defer = true;
      script.onload = () => {
        this.isLoaded = true;
        resolve();
      };
      script.onerror = () => reject('Google Maps failed to load');
      document.head.appendChild(script);
    });
  }

  /** Create a map instance */
  createMap(elementId: string, lat: number, lng: number, zoom = 14): google.maps.Map {
    return new google.maps.Map(document.getElementById(elementId) as HTMLElement, {
      center: { lat, lng },
      zoom,
    });
  }

  /** Create a marker instance */
  createMarker(map: google.maps.Map, lat: number, lng: number, draggable = false): google.maps.Marker {
    return new google.maps.Marker({
      position: { lat, lng },
      map,
      draggable,
    });
  }
}
