import type { Env, Tenant } from '../types/env';

export interface EnviaAddress {
  name: string;
  company?: string;
  email?: string;
  phone: string;
  street: string;
  number: string;
  district?: string;
  city: string;
  state: string; // Código de 2 o 3 letras ej. 'YUC', 'CMX', 'JAL'
  category?: number;
  country: string; // 'MX'
  postalCode: string;
}

export interface EnviaPackage {
  content: string;
  amount: number;
  type: string; // 'box', 'envelope', etc.
  weight: number; // en KG
  insurance?: number;
  declaredValue?: number;
  weightUnit: 'KG' | 'LB';
  lengthUnit: 'CM' | 'IN';
  dimensions: {
    length: number;
    width: number;
    height: number;
  };
}

export interface ShippingRateQuote {
  carrier: string;
  service: string;
  serviceDescription: string;
  deliveryEstimate: string;
  cost: number;
  currency: string;
  logoUrl?: string;
  isSimulated?: boolean;
}

export interface GeneratedLabelResult {
  trackingNumber: string;
  trackingUrl: string;
  labelUrl: string; // PDF directo
  carrier: string;
  service: string;
  totalCost: number;
  currency: string;
  isSimulated?: boolean;
}

export class EnviaService {
  private apiKey: string | null;
  private baseUrl: string;

  constructor(env: Env, tenant?: Tenant | null) {
    // La clave puede venir del tenant específico o de la variable global de la plataforma
    this.apiKey = tenant?.envia_api_key || env.ENVIA_API_KEY || null;
    const isSandbox = env.ENVIA_SANDBOX === 'true';
    this.baseUrl = isSandbox ? 'https://api-test.envia.com' : 'https://api.envia.com';
  }

  /**
   * Obtiene la dirección de origen predeterminada para el tenant.
   */
  public getTenantOrigin(tenant: Tenant): EnviaAddress {
    return {
      name: tenant.clabe_holder || tenant.name,
      company: tenant.name,
      email: 'envios@' + tenant.slug + '.com',
      phone: tenant.whatsapp || '529994918221',
      street: tenant.origin_street || 'Calle 60',
      number: tenant.origin_number || '320',
      district: tenant.origin_district || 'Centro',
      city: tenant.origin_city || 'Mérida',
      state: tenant.origin_state || 'YUC',
      category: 1,
      country: tenant.origin_country || 'MX',
      postalCode: tenant.origin_postal_code || '97050',
    };
  }

  /**
   * Cotiza tarifas de envío en tiempo real vía Envia.com.
   */
  async quoteRates(
    origin: EnviaAddress,
    destination: EnviaAddress,
    packages: EnviaPackage[]
  ): Promise<ShippingRateQuote[]> {
    if (!this.apiKey) {
      return this.getSimulatedQuotes(origin, destination, packages);
    }

    try {
      const payload = {
        origin,
        destination,
        packages,
        shipment: {
          carrier: '',
          service: '',
          type: 1,
        },
        settings: {
          currency: 'MXN',
        },
      };

      const res = await fetch(`${this.baseUrl}/ship/rate/`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        console.warn(`[Envia] Rate error ${res.status}: ${await res.text()}`);
        return this.getSimulatedQuotes(origin, destination, packages);
      }

      const json: any = await res.json();
      const rawData = json.data || [];

      if (!Array.isArray(rawData) || rawData.length === 0) {
        return this.getSimulatedQuotes(origin, destination, packages);
      }

      const quotes: ShippingRateQuote[] = rawData.map((item: any) => ({
        carrier: item.carrier || 'courier',
        service: item.service || 'standard',
        serviceDescription: item.serviceDescription || item.service || 'Envío Terrestre',
        deliveryEstimate: item.deliveryEstimate || item.deliveryDays ? `${item.deliveryDays} días hábiles` : '2-4 días',
        cost: Number(item.totalPrice || item.price || 0),
        currency: 'MXN',
        logoUrl: item.carrierLogo || `/images/carriers/${item.carrier}.svg`,
        isSimulated: false,
      }));

      // Ordenar por precio ascendente
      return quotes.sort((a, b) => a.cost - b.cost);
    } catch (err) {
      console.error('[Envia] Error in quoteRates:', err);
      return this.getSimulatedQuotes(origin, destination, packages);
    }
  }

  /**
   * Genera la guía de envío con PDF y tracking.
   */
  async generateLabel(
    origin: EnviaAddress,
    destination: EnviaAddress,
    packages: EnviaPackage[],
    carrier: string,
    service: string
  ): Promise<GeneratedLabelResult> {
    if (!this.apiKey) {
      return this.getSimulatedLabel(carrier, service);
    }

    try {
      const payload = {
        origin,
        destination,
        packages,
        shipment: {
          carrier: carrier.toLowerCase(),
          service: service.toLowerCase(),
          type: 1,
        },
        settings: {
          currency: 'MXN',
          printFormat: 'PDF',
          printSize: 'STOCK_4X6',
        },
      };

      const res = await fetch(`${this.baseUrl}/ship/generate/`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errText = await res.text();
        console.warn(`[Envia] Generate label error ${res.status}: ${errText}`);
        return this.getSimulatedLabel(carrier, service);
      }

      const json: any = await res.json();
      const data = Array.isArray(json.data) ? json.data[0] : json.data;

      if (!data || !data.trackingNumber) {
        return this.getSimulatedLabel(carrier, service);
      }

      return {
        trackingNumber: data.trackingNumber,
        trackingUrl: data.trackUrl || `https://envia.com/rastreo?tracking=${data.trackingNumber}`,
        labelUrl: data.label || data.labelUrl || '',
        carrier: data.carrier || carrier,
        service: data.service || service,
        totalCost: Number(data.totalPrice || 0),
        currency: 'MXN',
        isSimulated: false,
      };
    } catch (err) {
      console.error('[Envia] Error in generateLabel:', err);
      return this.getSimulatedLabel(carrier, service);
    }
  }

  /**
   * Consulta el rastreo de un paquete.
   */
  async trackShipment(carrier: string, trackingNumber: string): Promise<any> {
    if (!this.apiKey) {
      return {
        carrier,
        trackingNumber,
        status: 'in_transit',
        statusDescription: 'En tránsito a destino (Modo Simulación)',
        checkpoints: [
          { date: new Date().toISOString(), location: 'Centro de Distribución', description: 'Paquete recolectado y documentado' },
        ],
      };
    }

    try {
      const res = await fetch(`${this.baseUrl}/ship/generaltrack/${encodeURIComponent(carrier)}/${encodeURIComponent(trackingNumber)}`, {
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
        },
      });

      if (!res.ok) {
        return {
          carrier,
          trackingNumber,
          status: 'pending',
          statusDescription: 'Guía generada. Pendiente de recolección.',
        };
      }

      return await res.json();
    } catch (err) {
      console.error('[Envia] Error in trackShipment:', err);
      return { carrier, trackingNumber, error: 'No se pudo consultar el rastreo en este momento' };
    }
  }

  /**
   * Cotizaciones realistas mexicanas en modo fallback / simulación (cuando no hay API key o es testing).
   */
  private getSimulatedQuotes(
    origin: EnviaAddress,
    destination: EnviaAddress,
    packages: EnviaPackage[]
  ): ShippingRateQuote[] {
    const totalWeight = packages.reduce((acc, p) => acc + (p.weight * (p.amount || 1)), 0);
    // Base de cálculo aproximada según C.P. y peso
    const isSameZone = origin.state.toUpperCase() === destination.state.toUpperCase();
    const basePrice = isSameZone ? 110 : 155;
    const weightFee = Math.max(0, totalWeight - 1) * 25;

    return [
      {
        carrier: 'redpack',
        service: 'standard',
        serviceDescription: 'Redpack EcoExpress Terrestre',
        deliveryEstimate: isSameZone ? '1 a 2 días hábiles' : '3 a 5 días hábiles',
        cost: Math.round(basePrice + weightFee),
        currency: 'MXN',
        isSimulated: true,
      },
      {
        carrier: 'estafeta',
        service: 'ground',
        serviceDescription: 'Estafeta Terrestre',
        deliveryEstimate: isSameZone ? '24 horas' : '2 a 3 días hábiles',
        cost: Math.round(basePrice + 25 + weightFee),
        currency: 'MXN',
        isSimulated: true,
      },
      {
        carrier: 'fedex',
        service: 'express_saver',
        serviceDescription: 'FedEx Express Saver Prioritario',
        deliveryEstimate: '1 a 2 días hábiles',
        cost: Math.round(basePrice + 65 + weightFee),
        currency: 'MXN',
        isSimulated: true,
      },
    ];
  }

  private getSimulatedLabel(carrier: string, service: string): GeneratedLabelResult {
    const randomTracking = `${carrier.toUpperCase().slice(0, 3)}${Math.floor(1000000000 + Math.random() * 9000000000)}`;
    return {
      trackingNumber: randomTracking,
      trackingUrl: `https://envia.com/rastreo?tracking=${randomTracking}`,
      labelUrl: `https://api.envia.com/labels/demo/${randomTracking}.pdf`,
      carrier: carrier.toLowerCase(),
      service: service.toLowerCase(),
      totalCost: 165.0,
      currency: 'MXN',
      isSimulated: true,
    };
  }
}
