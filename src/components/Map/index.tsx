import * as React from 'react';
import { Dialog, DialogBackdrop, DialogPanel } from '@headlessui/react';
import Map, { Marker, NavigationControl } from 'react-map-gl/maplibre';
import { CITIES } from '../../content';
import './styles.css';
import { AnimatePresence, motion } from 'framer-motion';
import { FigCaption, H3, H4, P } from '../Base';

type TCity = (typeof CITIES)[0];

const minPopulation = CITIES.sort((city1, city2) => city1.CITY_POPULATION - city2.CITY_POPULATION)[0].CITY_POPULATION;
const maxPopulation = CITIES.sort((city1, city2) => city2.CITY_POPULATION - city1.CITY_POPULATION)[0].CITY_POPULATION;

const TriggerCitiesMap = () => {
  const [popupCity, setPopupCity] = React.useState<TCity | null>(null);
  const [hoverTier, setHoverTier] = React.useState<string | null>(null);
  const [isPopupOpen, setIsPopupOpen] = React.useState(false);
  const mapRef = React.useRef(null);

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
          {CITIES.map((city, idx) => (
            <TriggerCityMarker
              key={city.CITY_ID}
              city={city}
              onClick={(city: TCity) => {
                setHoverTier(null);
                setPopupCity(city);
                setIsPopupOpen(true);
              }}
              hoverTier={hoverTier}
              setHoverTier={setHoverTier}
              markerIdx={idx}
            />
          ))}
          {/* <Popup
             longitude={popupCity.CITY_LNG}
             latitude={popupCity.CITY_LAT}
             onClose={() => setPopupCity(null)}
             closeButton={false}
             style={{ background: 'red' }}
             offset={24}
           >
             <PopupContent city={popupCity} />
           </Popup> */}
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
  setHoverTier: (v: string | null) => void;
  markerIdx: number;
};

const TriggerCityMarker: React.FC<TriggerCityMarkerProps> = ({ city, onClick, setHoverTier, hoverTier, markerIdx }) => {
  const tierToClassName = {
    'Tier 1': 'tier1Marker',
    'Tier 2': 'tier2Marker',
    'Tier 3': 'tier3Marker',
    'Tier 4': 'tier4Marker',
  };
  const className = tierToClassName?.[city.TRIGGER_CITY_TIER as 'Tier 1' | 'Tier 2' | 'Tier 3' | 'Tier 4'];
  const size = `${getMarkerSize(city.CITY_POPULATION)}px`;

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
          onMouseEnter={() => setHoverTier(city.TRIGGER_CITY_TIER)}
          onMouseLeave={() => setHoverTier(null)}
          className={`mapMarker ${className}`}
          style={{ height: size, width: size, opacity: !!hoverTier && city.TRIGGER_CITY_TIER !== hoverTier ? 0.4 : 1 }}
        />
      </motion.div>
    </Marker>
  );
};

const getMarkerSize = (cityPopulation: number) => {
  const minSize = 22;
  const maxSize = 92;
  const ratio = (cityPopulation - minPopulation) / (maxPopulation - minPopulation);
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
            <div>
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
          </DialogPanel>
        </Dialog>
      )}
    </AnimatePresence>
  );
};

// const PopupContent: React.FC<TPopupContentProps> = ({ city }) => {
//   return (
//     <div className="flex flex-row bg-zinc-950 border border-gray-800 rounded-sm w-[644px] shadow-lg">
//       <div className="w-1/2">
//         <div className="bg-gray-300 w-full h-36 p-6">
//           <div className="p-2 bg-black text-gray-100 w-fit rounded-lg font-semibold">
//             {city.CONTINENT.toUpperCase()}
//           </div>
//         </div>
//         <div className="px-10 pt-4 pb-10 w-full">
//           <div className="flex flex-row justify-between items-center border-b border-white mb-6">
//             <h4 className="text-xl font-bold">{city.CITY_NAME}</h4>
//             <p className="text-lg">{city.COUNTRY_NAME}</p>
//           </div>
//           <p>
//             Chicago is the most populous city in the U.S. state of Illinois and in the Midwestern United States. Located
//             on the shore of Lake Michigan, Chicago was incorporated as a city in 1837 near a portage between the Great
//             Lakes and the Mississippi River watershed. Chicago is the most populous city in the U.S. state of Illinois
//             and in the Midwestern United States.
//           </p>
//         </div>
//       </div>
//       <div className="w-1/2 flex flex-col px-10 py-6 bg-gray-950">
//         <div className="text-center rounded-lg border border-white p-2 font-semibold">
//           {city.TRIGGER_CITY_TIER.toUpperCase()}
//         </div>
//         <div className="mt-4">
//           <p className="border-b border-gray-300 pb-2 text-lg font-bold">Population</p>
//           <p className="text-lg pt-2">{city.CITY_POPULATION.toLocaleString()}</p>
//         </div>
//         <div className="mt-6">
//           <p className="border-b border-gray-300 pb-2 text-lg font-bold mb-2">Top 5 Genres</p>
//           {city.CITY_TOP_5_GENRES.map((genre, i) => {
//             return (
//               <p key={genre} className="py-2 text-lg border-b border-gray-600">
//                 {genre}
//                 <span className="float-right font-bold text-gray-600">{i}</span>
//               </p>
//             );
//           })}
//         </div>
//       </div>
//     </div>
//   );
// };

export default TriggerCitiesMap;
