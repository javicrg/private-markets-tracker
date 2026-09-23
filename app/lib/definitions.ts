interface Customer {
  codigo: string;
  productos: CustomerProduct[];
}

interface CustomerProduct {
  id: string;
  name: string;
  entryDate: string;
  compromiso: number;
  buyType: 'emision' | 'ampliacion' | 'secundario';
  valorCompra?: number;
}

interface CapitalCall {
  type: string;
  percentage: number;
  date: string;
}

interface Distribution {
  type: string;
  percentage: number;
  date: string;
}

interface Product {
  name: string;
  label: string;
  capitalCalls: CapitalCall[];
  distibutions: Distribution[];
}

export type { Customer, CapitalCall, Distribution, Product, CustomerProduct };
