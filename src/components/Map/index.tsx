import * as React from 'react';
import { Dialog, DialogBackdrop, DialogPanel } from '@headlessui/react';
import Map, { Marker, NavigationControl, Popup } from 'react-map-gl/maplibre';
import './styles.css';
import { AnimatePresence, motion } from 'framer-motion';
import { FigCaption, H3, H4, P } from '../Base';
import parse from 'html-react-parser';

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
  CITY_DESCRIPTION: string;
  CITY_IMAGE: string;
};

type TTriggerCitiesMapProps = {
  cities: TCity[];
};

function isMobile() {
  return /Mobi|Android/i.test(navigator.userAgent);
}

const cacheImage = async (imgUrl: string) => {
  const promise = new Promise(function (resolve, reject) {
    const img = new Image();
    img.src = imgUrl;
  });

  await Promise.all([promise]);
};

const TriggerCitiesMap: React.FC<TTriggerCitiesMapProps> = ({ cities }) => {
  const [popupCity, setPopupCity] = React.useState<TCity | null>(null);
  const [tooltipCity, setTooltipCity] = React.useState<TCity | null>(null);
  const [hoverTier, setHoverTier] = React.useState<string | null>(null);
  const [isPopupOpen, setIsPopupOpen] = React.useState(false);
  const mapRef = React.useRef(null);
  const mapContainerRef = React.useRef<HTMLDivElement | null>(null);
  const onMobileDevice = isMobile();

  const minPopulation =
    cities.sort((city1, city2) => city1.CITY_POPULATION - city2.CITY_POPULATION)?.[0]?.CITY_POPULATION ?? 0;
  const maxPopulation =
    cities.sort((city1, city2) => city2.CITY_POPULATION - city1.CITY_POPULATION)?.[0]?.CITY_POPULATION ?? 100000;

  React.useEffect(() => {
    if (cities?.length > 0) {
      setTimeout(() => {
        if (mapContainerRef.current) {
          mapContainerRef.current.style.backgroundImage =
            'url("https://images.unsplash.com/photo-1579547945478-a6681fb3c3c9?q=80&w=2970&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D")';
        }
      }, 50);
    }
  }, [cities?.length]);

  return (
    <>
      <div ref={mapContainerRef} id="map-container">
        <Map
          ref={mapRef}
          initialViewState={{
            longitude: 0,
            latitude: 0,
            zoom: 1.5,
          }}
          style={{ opacity: 0.95 }}
          mapStyle="https://prashanthselvam.github.io/chartmetric-trigger-cities-v2/map_style.json"
          // mapStyle={'/map_style.json'}
          scrollZoom={false}
          maxBounds={[
            [-179.9999999, -65],
            [179.9999999, 70],
          ]}
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
                  cacheImage(city.CITY_IMAGE);
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
            <div className="legendMarker" style={{ backgroundColor: 'var(--color-tier-1)' }} />
            <FigCaption>Tier 1</FigCaption>
          </figure>
          <figure onMouseEnter={() => setHoverTier('Tier 2')} onMouseLeave={() => setHoverTier(null)}>
            <div className="legendMarker" style={{ backgroundColor: 'var(--color-tier-2)' }} />
            <FigCaption>Tier 2</FigCaption>
          </figure>
          <figure onMouseEnter={() => setHoverTier('Tier 3')} onMouseLeave={() => setHoverTier(null)}>
            <div className="legendMarker" style={{ backgroundColor: 'var(--color-tier-3)' }} />
            <FigCaption>Tier 3</FigCaption>
          </figure>
          <figure onMouseEnter={() => setHoverTier('Tier 4')} onMouseLeave={() => setHoverTier(null)}>
            <div className="legendMarker" style={{ backgroundColor: 'var(--color-tier-4)' }} />
            <FigCaption>Tier 4</FigCaption>
          </figure>
          <figure>
            <LegendSvg />
            <FigCaption>Population Size</FigCaption>
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
        <div
          className="mapMarkerOutline"
          style={
            !!hoverTier && city.TRIGGER_CITY_TIER !== hoverTier ? { outlineColor: 'rgba(244, 244, 244, 0.4)' } : {}
          }
        >
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

function formatNumber(num: number) {
  if (num >= 1_000_000) {
    return (num / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M';
  } else if (num >= 1_000) {
    return (num / 1_000).toFixed(1).replace(/\.0$/, '') + 'K';
  }
  return num.toString();
}

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
                  <P className="cityInfoDesc">{parse(city.CITY_DESCRIPTION)}</P>
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
                    <P className="statsPopulation">{formatNumber(city.CITY_POPULATION)}</P>
                  </div>
                  <div className="mt-6">
                    <P className="statsTitle">Top 5 Genres</P>
                    {city.CITY_TOP_5_GENRES.map((genre, i) => {
                      return (
                        <P key={genre} className="genreItem">
                          <span className="float-left font-bold text-gray-600">{i + 1}</span>
                          {genre}
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

const LegendSvg = () => {
  return (
    <svg width="51" height="22" viewBox="0 0 51 22" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M11 11.0006C11 13.7608 8.761 15.9992 6 15.9992C3.239 15.9992 1 13.7608 1 11.0006C1 8.24034 3.239 6.00195 6 6.00195C8.761 6.00195 11 8.24034 11 11.0006Z"
        stroke="#F4F4F4"
        stroke-width="0.6"
        stroke-miterlimit="10"
      />
      <path
        d="M28 11C28 15.1416 24.6415 18.5 20.5 18.5C16.3585 18.5 13 15.1416 13 11C13 6.85852 16.3585 3.5 20.5 3.5C24.6415 3.5 28 6.85852 28 11Z"
        stroke="#F4F4F4"
        stroke-width="0.6"
        stroke-miterlimit="10"
      />
      <path
        d="M50.0057 11C50.0057 16.5241 45.5268 21 40.004 21C34.4811 21 30 16.5241 30 11C30 5.47587 34.4789 1 40.0017 1C45.5245 1 50.0034 5.47811 50.0034 11"
        stroke="#F4F4F4"
        stroke-width="0.6"
        stroke-miterlimit="10"
      />
      <path
        d="M31.7879 10.7879C31.6707 10.905 31.6707 11.095 31.7879 11.2121L33.6971 13.1213C33.8142 13.2385 34.0042 13.2385 34.1213 13.1213C34.2385 13.0042 34.2385 12.8142 34.1213 12.6971L32.4243 11L34.1213 9.30294C34.2385 9.18579 34.2385 8.99584 34.1213 8.87868C34.0042 8.76152 33.8142 8.76152 33.6971 8.87868L31.7879 10.7879ZM48.2121 11.2121C48.3293 11.095 48.3293 10.905 48.2121 10.7879L46.3029 8.87868C46.1858 8.76152 45.9958 8.76152 45.8787 8.87868C45.7615 8.99584 45.7615 9.18579 45.8787 9.30294L47.5757 11L45.8787 12.6971C45.7615 12.8142 45.7615 13.0042 45.8787 13.1213C45.9958 13.2385 46.1858 13.2385 46.3029 13.1213L48.2121 11.2121ZM32.5333 11.3C32.699 11.3 32.8333 11.1657 32.8333 11C32.8333 10.8343 32.699 10.7 32.5333 10.7V11.3ZM34.1333 10.7C33.9676 10.7 33.8333 10.8343 33.8333 11C33.8333 11.1657 33.9676 11.3 34.1333 11.3V10.7ZM35.2 11.3C35.3657 11.3 35.5 11.1657 35.5 11C35.5 10.8343 35.3657 10.7 35.2 10.7V11.3ZM36.8 10.7C36.6343 10.7 36.5 10.8343 36.5 11C36.5 11.1657 36.6343 11.3 36.8 11.3V10.7ZM37.8667 11.3C38.0324 11.3 38.1667 11.1657 38.1667 11C38.1667 10.8343 38.0324 10.7 37.8667 10.7V11.3ZM39.4667 10.7C39.301 10.7 39.1667 10.8343 39.1667 11C39.1667 11.1657 39.301 11.3 39.4667 11.3V10.7ZM40.5333 11.3C40.699 11.3 40.8333 11.1657 40.8333 11C40.8333 10.8343 40.699 10.7 40.5333 10.7V11.3ZM42.1333 10.7C41.9676 10.7 41.8333 10.8343 41.8333 11C41.8333 11.1657 41.9676 11.3 42.1333 11.3V10.7ZM43.2 11.3C43.3657 11.3 43.5 11.1657 43.5 11C43.5 10.8343 43.3657 10.7 43.2 10.7V11.3ZM44.8 10.7C44.6343 10.7 44.5 10.8343 44.5 11C44.5 11.1657 44.6343 11.3 44.8 11.3V10.7ZM45.8667 11.3C46.0324 11.3 46.1667 11.1657 46.1667 11C46.1667 10.8343 46.0324 10.7 45.8667 10.7V11.3ZM47.4667 10.7C47.301 10.7 47.1667 10.8343 47.1667 11C47.1667 11.1657 47.301 11.3 47.4667 11.3V10.7ZM32 11.3H32.5333V10.7H32V11.3ZM34.1333 11.3H35.2V10.7H34.1333V11.3ZM36.8 11.3H37.8667V10.7H36.8V11.3ZM39.4667 11.3H40.5333V10.7H39.4667V11.3ZM42.1333 11.3H43.2V10.7H42.1333V11.3ZM44.8 11.3H45.8667V10.7H44.8V11.3ZM47.4667 11.3H48V10.7H47.4667V11.3Z"
        fill="white"
      />
    </svg>
  );
};
