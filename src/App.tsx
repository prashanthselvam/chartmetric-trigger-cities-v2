import React, { SVGProps } from 'react';
import './App.css';
import TriggerCitiesMap, { TCity } from './components/Map';
import { H1 } from './components/Base';

const Logo = (props: SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={34} height={35} fill="none" {...props}>
    <path
      fill="#F4F4F4"
      d="m15.588.823.349-.352a1.234 1.234 0 0 1 2.044.45c.062.163.114 2.092.115 4.287.002 3.599.023 4.015.209 4.246.53.66 1.302.707 1.888.116l.406-.408V6.228l.405-.409c.313-.315.505-.409.84-.409.465 0 .94.25 1.1.579.055.111.127 2.818.16 6.014l.06 5.811.39.351c.45.407 1.114.472 1.564.155.55-.388.61-.782.61-3.956 0-1.799.048-3.048.123-3.189.068-.127.28-.313.471-.413.544-.283 1.021-.228 1.462.17l.39.35.033 5.596c.037 6.195.03 6.252-.694 6.63a1.301 1.301 0 0 1-1.5-.245c-.226-.229-.285-.414-.285-.906 0-1.274-.755-2.002-1.725-1.664-.85.296-.899.518-.899 4.111 0 3.369-.044 3.629-.653 3.909-.564.259-1.007.178-1.447-.266l-.405-.408v-7.522c0-5.575-.037-7.602-.143-7.836-.177-.39-.67-.658-1.214-.658-.304 0-.513.1-.782.37l-.367.37v10.095c0 11.253.034 10.775-.788 11.121-.533.225-.946.14-1.389-.284l-.328-.315v-3.254c0-1.913-.053-3.442-.127-3.71a1.121 1.121 0 0 0-.506-.692c-.459-.281-.812-.296-1.28-.052-.5.261-.711.757-.711 1.673 0 .688-.041.832-.328 1.153-.608.68-1.753.506-2.061-.311-.07-.183-.117-2.446-.117-5.579v-5.27l-.421-.373c-.616-.545-1.36-.485-1.872.152-.181.225-.207.573-.21 2.816-.002 2.925-.067 3.225-.768 3.56-.537.257-1.01.174-1.432-.252l-.307-.31V11.227l.328-.307c.449-.421.902-.51 1.397-.273.594.284.78.785.78 2.099 0 1.082.008 1.113.37 1.454.544.511 1.185.49 1.73-.06l.405-.408v-3.686c0-4.124.025-4.266.794-4.59a1.261 1.261 0 0 1 1.429.333c.212.236.226.656.283 8.602l.06 8.354.389.35c.452.407 1.115.473 1.565.155.624-.44.61-.181.61-11.712V.823ZM.018 17.414c-.099-.403.216-1.105.575-1.28.798-.388 1.801.151 1.801.968 0 .232-.094.566-.209.742-.562.864-1.914.595-2.167-.43ZM30.977 17.092c0-.387.07-.538.367-.79 1.116-.946 2.655.473 1.723 1.588-.364.436-.895.56-1.431.334-.486-.205-.659-.501-.659-1.132Z"
    />
  </svg>
);

type TToggleButtonProps = {
  active: 'MAP' | 'TABLE';
  setActive: (v: 'MAP' | 'TABLE') => void;
};

const ToggleButton: React.FC<TToggleButtonProps> = ({ active, setActive }) => {
  return (
    <div className="toggleBtnContainer">
      <button onClick={() => setActive('MAP')} className={active === 'MAP' ? 'active' : ''}>
        Map
      </button>
      <button onClick={() => setActive('TABLE')} className={active === 'TABLE' ? 'active' : ''}>
        Table
      </button>
    </div>
  );
};

const FlourishEmbed = () => {
  React.useEffect(() => {
    const el = document.getElementById('flourish-real');

    if (el?.children?.length == 0) {
      // @ts-ignore
      window.Flourish.loadEmbed(el);
    }
  }, []);

  return <div id="flourish-real" className="flourish-embed flourish-table" data-src="visualisation/18671732"></div>;
};

function App() {
  const [active, setActive] = React.useState<'MAP' | 'TABLE'>('MAP');
  const [cities, setCities] = React.useState<TCity[]>([]);

  React.useEffect(() => {
    fetch('https://prashanthselvam.github.io/chartmetric-trigger-cities-v2/cities.json')
      .then((response) => response.json())
      .then((data) => setCities(data))
      .catch((error) => console.error('Error fetching cities:', error));
  }, []);

  return (
    <div className="App">
      <div className="topBar">
        <Logo />
        <H1>Trigger Cities</H1>
        <ToggleButton active={active} setActive={setActive} />
      </div>
      <div style={{ height: 'calc(100% - 64px)' }} className={active === 'MAP' ? 'visible' : 'hidden'}>
        <TriggerCitiesMap cities={cities} />
      </div>
      <div className={active === 'TABLE' ? 'visible' : 'hidden'}>
        <FlourishEmbed />
      </div>
    </div>
  );
}

export default App;
