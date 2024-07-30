import * as React from 'react';
import Map, { Marker, Popup, NavigationControl } from 'react-map-gl/maplibre';
import { CITIES } from '../../content';
import './styles.css';

type TCity = (typeof CITIES)[0];

const minPopulation = CITIES.sort((city1, city2) => city1.CITY_POPULATION - city2.CITY_POPULATION)[0].CITY_POPULATION;
const maxPopulation = CITIES.sort((city1, city2) => city2.CITY_POPULATION - city1.CITY_POPULATION)[0].CITY_POPULATION;

const TriggerCitiesMap = () => {
  const [popupCity, setPopupCity] = React.useState<TCity | null>(null);
  const mapRef = React.useRef(null);

  return (
    <Map
      ref={mapRef}
      initialViewState={{
        longitude: 0,
        latitude: 0,
        zoom: 1.5,
      }}
      style={{ width: '100%', height: 'calc(100% - 64px)', opacity: 0.95 }}
      mapStyle="https://prashanthselvam.github.io/chartmetric-trigger-cities-v2/map_style.json"
      scrollZoom={false}
    >
      {CITIES.map((city) => (
        <TriggerCityMarker key={city.CITY_ID} city={city} onMouseOver={(city: TCity) => setPopupCity(city)} />
      ))}
      {!!popupCity && (
        <Popup
          longitude={popupCity.CITY_LNG}
          latitude={popupCity.CITY_LAT}
          onClose={() => setPopupCity(null)}
          closeButton={false}
          style={{ background: 'red' }}
          offset={24}
        >
          <PopupContent city={popupCity} />
        </Popup>
      )}
      <NavigationControl position="top-right" showZoom={true} />
    </Map>
  );
};

type TriggerCityMarkerProps = {
  city: TCity;
  onMouseOver: (city: TCity) => void;
};

const TriggerCityMarker: React.FC<TriggerCityMarkerProps> = ({ city, onMouseOver }) => {
  const tierToClassName = {
    'Tier 1': 'tier1Marker',
    'Tier 2': 'tier2Marker',
    'Tier 3': 'tier3Marker',
    'Tier 4': 'tier4Marker',
  };
  const className = tierToClassName?.[city.TRIGGER_CITY_TIER as 'Tier 1' | 'Tier 2' | 'Tier 3' | 'Tier 4'];
  const size = `${getMarkerSize(city.CITY_POPULATION)}px`;

  return (
    <Marker longitude={city.CITY_LNG} latitude={city.CITY_LAT} anchor="bottom">
      <div
        // className={`rounded-full outline-white outline -outline-offset-4 ${className}`}
        className={className}
        style={{ outlineWidth: 'thin', height: size, width: size, borderRadius: 200 }}
        onMouseOver={() => onMouseOver(city)}
      />
    </Marker>
  );
};

const getMarkerSize = (cityPopulation: number) => {
  const minSize = 16;
  const maxSize = 72;
  const ratio = (cityPopulation - minPopulation) / (maxPopulation - minPopulation);
  const size = ratio * (maxSize - minSize) + minSize;

  return Math.floor(size);
};

type TPopupContentProps = {
  city: TCity;
};

const PopupContent: React.FC<TPopupContentProps> = ({ city }) => {
  return (
    <div className="flex flex-row bg-zinc-950 border border-gray-800 rounded-sm w-[644px] shadow-lg">
      <div className="w-1/2">
        <div className="bg-gray-300 w-full h-36 p-6">
          <div className="p-2 bg-black text-gray-100 w-fit rounded-lg font-semibold">
            {city.CONTINENT.toUpperCase()}
          </div>
        </div>
        <div className="px-10 pt-4 pb-10 w-full">
          <div className="flex flex-row justify-between items-center border-b border-white mb-6">
            <h4 className="text-xl font-bold">{city.CITY_NAME}</h4>
            <p className="text-lg">{city.COUNTRY_NAME}</p>
          </div>
          <p>
            Chicago is the most populous city in the U.S. state of Illinois and in the Midwestern United States. Located
            on the shore of Lake Michigan, Chicago was incorporated as a city in 1837 near a portage between the Great
            Lakes and the Mississippi River watershed. Chicago is the most populous city in the U.S. state of Illinois
            and in the Midwestern United States.
          </p>
        </div>
      </div>
      <div className="w-1/2 flex flex-col px-10 py-6 bg-gray-950">
        <div className="text-center rounded-lg border border-white p-2 font-semibold">
          {city.TRIGGER_CITY_TIER.toUpperCase()}
        </div>
        <div className="mt-4">
          <p className="border-b border-gray-300 pb-2 text-lg font-bold">Population</p>
          <p className="text-lg pt-2">{city.CITY_POPULATION.toLocaleString()}</p>
        </div>
        <div className="mt-6">
          <p className="border-b border-gray-300 pb-2 text-lg font-bold mb-2">Top 5 Genres</p>
          {city.CITY_TOP_5_GENRES.map((genre, i) => {
            return (
              <p key={genre} className="py-2 text-lg border-b border-gray-600">
                {genre}
                <span className="float-right font-bold text-gray-600">{i}</span>
              </p>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default TriggerCitiesMap;
