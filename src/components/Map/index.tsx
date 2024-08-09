import * as React from 'react';
import { Dialog, DialogBackdrop, DialogPanel } from '@headlessui/react';
import Map, { Marker, NavigationControl, Popup } from 'react-map-gl/maplibre';
import './styles.css';
import { AnimatePresence, motion } from 'framer-motion';
import { FigCaption, H3, H4, P } from '../Base';
import { useMobileDetector } from '../../utils';

export type TCity = {
  CITY_ID: number;
  CITY_NAME: string;
  TRIGGER_CITY_COUNT: number;
  TRIGGER_CITY_TIER: string;
  CITY_POPULATION: number;
  CITY_LAT: number;
  CITY_LNG: number;
  COUNTRY_NAME: string;
  CONTINENT: string;
  CITY_TOP_GENRE: string;
  CITY_TOP_5_GENRES: string[];
  CITY_DESC: string;
  CITY_IMAGE: string;
};

type TTriggerCitiesMapProps = {
  cities: TCity[];
};

function isMobile() {
  return /Mobi|Android/i.test(navigator.userAgent);
}

const TriggerCitiesMap: React.FC<TTriggerCitiesMapProps> = ({ cities }) => {
  const [popupCity, setPopupCity] = React.useState<TCity | null>(null);
  const [tooltipCity, setTooltipCity] = React.useState<TCity | null>(null);
  const [hoverTier, setHoverTier] = React.useState<string | null>(null);
  const [isPopupOpen, setIsPopupOpen] = React.useState(false);
  const mapRef = React.useRef(null);
  const onMobileDevice = isMobile();

  const minPopulation =
    cities.sort((city1, city2) => city1.CITY_POPULATION - city2.CITY_POPULATION)?.[0]?.CITY_POPULATION ?? 0;
  const maxPopulation =
    cities.sort((city1, city2) => city2.CITY_POPULATION - city1.CITY_POPULATION)?.[0]?.CITY_POPULATION ?? 100000;

  return (
    <>
      <div id="map-container">
        <Map
          ref={mapRef}
          initialViewState={{
            longitude: 0,
            latitude: 0,
            zoom: 1.5,
          }}
          style={{ opacity: 0.95 }}
          mapStyle="https://prashanthselvam.github.io/chartmetric-trigger-cities-v2/map_style.json"
          scrollZoom={false}
        >
          {cities.map((city, idx) => (
            <TriggerCityMarker
              key={city.CITY_ID}
              city={city}
              onClick={(city: TCity) => {
                setHoverTier(null);
                setTooltipCity(null);
                setPopupCity(city);
                setIsPopupOpen(true);
              }}
              hoverTier={hoverTier}
              minPopulation={minPopulation}
              maxPopulation={maxPopulation}
              handleMouseEnter={() => {
                if (!onMobileDevice) {
                  setHoverTier(city.TRIGGER_CITY_TIER);
                  setTooltipCity(city);
                }
              }}
              handleMouseLeave={() => {
                if (!onMobileDevice) {
                  setHoverTier(null);
                  setTooltipCity(null);
                }
              }}
            />
          ))}
          {!!tooltipCity && (
            <Popup
              longitude={tooltipCity.CITY_LNG}
              latitude={tooltipCity.CITY_LAT}
              className="cityTooltip"
              closeButton={false}
              offset={-38}
            >
              {tooltipCity.CITY_NAME}
            </Popup>
          )}
          <NavigationControl position="top-right" showZoom={true} />
        </Map>
        <div id="legend">
          <figure onMouseEnter={() => setHoverTier('Tier 1')} onMouseLeave={() => setHoverTier(null)}>
            <div
              className="legendMarker"
              style={{ backgroundColor: 'var(--color-tier-1)', width: '16.1px', height: '16.1px' }}
            />
            <FigCaption>Tier 1</FigCaption>
          </figure>
          <figure onMouseEnter={() => setHoverTier('Tier 2')} onMouseLeave={() => setHoverTier(null)}>
            <div
              className="legendMarker"
              style={{ backgroundColor: 'var(--color-tier-2)', width: '12px', height: '12px' }}
            />
            <FigCaption>Tier 2</FigCaption>
          </figure>
          <figure onMouseEnter={() => setHoverTier('Tier 3')} onMouseLeave={() => setHoverTier(null)}>
            <div
              className="legendMarker"
              style={{ backgroundColor: 'var(--color-tier-3)', width: '9px', height: '9px' }}
            />
            <FigCaption>Tier 3</FigCaption>
          </figure>
          <figure onMouseEnter={() => setHoverTier('Tier 4')} onMouseLeave={() => setHoverTier(null)}>
            <div
              className="legendMarker"
              style={{ backgroundColor: 'var(--color-tier-4)', width: '7px', height: '7px' }}
            />
            <FigCaption>Tier 4</FigCaption>
          </figure>
        </div>
      </div>
      <PopupContent city={popupCity} handleClose={() => setIsPopupOpen(false)} isPopupOpen={isPopupOpen} />
    </>
  );
};

type TriggerCityMarkerProps = {
  city: TCity;
  onClick: (city: TCity) => void;
  hoverTier: string | null;
  minPopulation: number;
  maxPopulation: number;
  handleMouseEnter: () => void;
  handleMouseLeave: () => void;
};

const TriggerCityMarker: React.FC<TriggerCityMarkerProps> = ({
  city,
  onClick,
  hoverTier,
  minPopulation,
  maxPopulation,
  handleMouseEnter,
  handleMouseLeave,
}) => {
  const tierToClassName = {
    'Tier 1': 'tier1Marker',
    'Tier 2': 'tier2Marker',
    'Tier 3': 'tier3Marker',
    'Tier 4': 'tier4Marker',
  };
  const className = tierToClassName?.[city.TRIGGER_CITY_TIER as 'Tier 1' | 'Tier 2' | 'Tier 3' | 'Tier 4'];
  const size = `${getMarkerSize(city.CITY_POPULATION, minPopulation, maxPopulation)}px`;

  const tierNumber = parseInt(city.TRIGGER_CITY_TIER.slice(-1));

  return (
    <Marker longitude={city.CITY_LNG} latitude={city.CITY_LAT} anchor="bottom" onClick={() => onClick(city)}>
      <motion.div
        initial={{ opacity: 0, y: -25 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        animate={{ y: 0 }}
        transition={{ duration: 0.3, delay: tierNumber * 0.5 }}
      >
        <div className="mapMarkerOutline">
          <div
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            className={`mapMarker ${className}`}
            style={{
              height: size,
              width: size,
              opacity: !!hoverTier && city.TRIGGER_CITY_TIER !== hoverTier ? 0.4 : 1,
            }}
          />
        </div>
      </motion.div>
    </Marker>
  );
};

const getMarkerSize = (cityPopulation: number, min: number, max: number) => {
  const minSize = 22;
  const maxSize = 92;
  const ratio = (cityPopulation - min) / (max - min);
  const size = ratio * (maxSize - minSize) + minSize;

  return Math.floor(size);
};

type TPopupContentProps = {
  city: TCity | null;
  handleClose: () => void;
  isPopupOpen: boolean;
};

const PopupContent: React.FC<TPopupContentProps> = ({ city, handleClose, isPopupOpen }) => {
  const tierToPillClassName = {
    'Tier 1': 'tier1Pill',
    'Tier 2': 'tier2Pill',
    'Tier 3': 'tier3Pill',
    'Tier 4': 'tier4Pill',
  };
  const pillClassName = tierToPillClassName?.[city?.TRIGGER_CITY_TIER as 'Tier 1' | 'Tier 2' | 'Tier 3' | 'Tier 4'];

  return (
    <AnimatePresence>
      {city && isPopupOpen && (
        <Dialog static open={isPopupOpen} as="div" className="popupContainer" onClose={handleClose}>
          <DialogBackdrop
            as={motion.div}
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.6 }}
            exit={{ opacity: 0 }}
            className="popupBackdrop"
          />
          <DialogPanel
            as={motion.div}
            initial={{ opacity: 0, scale: 0.75 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="popupMain"
          >
            <button onClick={handleClose} className="closeBtn">
              X
            </button>
            <div>
              <div className="popupInfoPane">
                <div
                  className="cityImage"
                  style={{
                    backgroundImage: `url(${city.CITY_IMAGE})`,
                  }}
                >
                  <div className="cityImageOverlay" />
                  <H4>{city.CONTINENT}</H4>
                </div>
                <div className="cityInfo">
                  <div className="cityInfoTitle">
                    <H3>{city.CITY_NAME}</H3>
                    <P>{city.COUNTRY_NAME}</P>
                  </div>
                  <P className="cityInfoDesc">{city.CITY_DESC}</P>
                </div>
              </div>
              <div className="popupStatsPane">
                <div className="tierPillContainer">
                  <div className={`tierPill ${pillClassName}`}>{city.TRIGGER_CITY_TIER}</div>
                  <P>{city.TRIGGER_CITY_TIER}</P>
                </div>
                <div className="statsContainer">
                  <div>
                    <P className="statsTitle">Population</P>
                    <P className="statsPopulation">{city.CITY_POPULATION.toLocaleString()}</P>
                  </div>
                  <div className="mt-6">
                    <P className="statsTitle">Top 5 Genres</P>
                    {city.CITY_TOP_5_GENRES.map((genre, i) => {
                      return (
                        <P key={genre} className="genreItem">
                          {genre}
                          <span className="float-right font-bold text-gray-600">{i}</span>
                        </P>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </DialogPanel>
        </Dialog>
      )}
    </AnimatePresence>
  );
};

export default TriggerCitiesMap;
