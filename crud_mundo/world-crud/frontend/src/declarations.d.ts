declare module 'react-globe.gl' {
  import { Ref, CSSProperties } from 'react';
  interface GlobeProps {
    ref?: Ref<any>;
    width?: number;
    height?: number;
    globeImageUrl?: string;
    bumpImageUrl?: string;
    backgroundImageUrl?: string;
    showAtmosphere?: boolean;
    atmosphereColor?: string;
    atmosphereAltitude?: number;
    polygonsData?: object[];
    polygonAltitude?: number | ((d: object) => number);
    polygonCapColor?: string | ((d: object) => string);
    polygonSideColor?: string | ((d: object) => string);
    polygonStrokeColor?: string | ((d: object) => string);
    polygonLabel?: string | ((d: object) => string);
    onPolygonClick?: (d: object, event: MouseEvent, coords: object) => void;
    onPolygonHover?: (d: object | null, prev: object | null) => void;
    ringsData?: object[];
    ringColor?: string | ((d: object) => string);
    ringMaxRadius?: number | ((d: object) => number);
    ringPropagationSpeed?: number | ((d: object) => number);
    ringRepeatPeriod?: number | ((d: object) => number);
    [key: string]: unknown;
  }
  export default function Globe(props: GlobeProps): JSX.Element;
}

declare module 'react-simple-maps' {
  import { ReactNode, CSSProperties, MouseEventHandler } from 'react';

  interface ComposableMapProps {
    projection?: string;
    projectionConfig?: Record<string, unknown>;
    style?: CSSProperties;
    children?: ReactNode;
  }

  interface ZoomableGroupProps {
    zoom?: number;
    center?: [number, number];
    onMoveEnd?: (pos: { zoom: number; coordinates: [number, number] }) => void;
    children?: ReactNode;
  }

  interface GeographiesProps {
    geography: string | object;
    children: (args: { geographies: GeoFeature[] }) => ReactNode;
  }

  interface GeoFeature {
    rsmKey: string;
    id: string;
    properties: Record<string, unknown>;
  }

  interface GeographyStyleDef {
    fill?: string;
    stroke?: string;
    strokeWidth?: number;
    outline?: string;
    cursor?: string;
    transition?: string;
  }

  interface GeographyProps {
    geography: GeoFeature;
    style?: {
      default?: GeographyStyleDef;
      hover?: GeographyStyleDef;
      pressed?: GeographyStyleDef;
    };
    onClick?: (geo: GeoFeature) => void;
    onMouseEnter?: MouseEventHandler<SVGPathElement>;
    onMouseLeave?: MouseEventHandler<SVGPathElement>;
    key?: string;
  }

  export function ComposableMap(props: ComposableMapProps): JSX.Element;
  export function ZoomableGroup(props: ZoomableGroupProps): JSX.Element;
  export function Geographies(props: GeographiesProps): JSX.Element;
  export function Geography(props: GeographyProps): JSX.Element;
}
