import './App.css';
import React, { useState, useEffect } from 'react';
import { getPlugins } from './PluginService';

function App(){

  useEffect(() => {
    async function getData () {
      let plugins = await getPlugins();
      setPlugins(plugins);
      
      setSummary({
        total: plugins.length,
        major: plugins.filter((p) => p.changeStage === 'major').length,
        minor: plugins.filter((p) => p.changeStage === 'minor').length,
        patch: plugins.filter((p) => p.changeStage === 'patch').length
      });
    }

    getData();
  },[])

  const [plugins, setPlugins] = useState([{
    name: 'Please Wait. Retreiving plugins and checking NPM registery. This may take a half minute.',
    pluginVersion: '',
    npmVersion: '',
    changeStage: ''
  }])

  const [summary, setSummary] = useState({
    total: '-',
    major: '-',
    minor: '-',
    patch: '-'
  });

  return(
    <div className="App p-5 text-sm">
      <h1 className="justify-normal m-2 font-bold text-xl">Netlify Plugin Updates</h1>
      <div className='p-2'>
        Total updated: {summary.total}<br/>
        Major: {summary.major}<br/>
        Minor: {summary.minor}<br/>
        Patch: {summary.patch}<br/>
      </div>
      <table className="table-auto">
      <thead className='text-left'>
        <tr className='border-b-1'>
          <th className='p-2'>Name</th>
          <th className='p-2'>Plugin Version</th>
          <th className='p-2'>NPM Version</th>
          <th className='p-2'>Stage</th>
        </tr>
      </thead>
      <tbody>
        {plugins.map((plugin, index) => (
          <tr key={index} className={plugin.changeStage + ' border-grey-900 border-b-1'}>
            <td className='p-2'><a href={plugin.packageUrl} target='_blank'>{plugin.name}</a></td>
            <td className='p-2'>{plugin.pluginVersion}</td>
            <td className='p-2'>{plugin.npmVersion}</td>
            <td className='p-2'>{plugin.changeStage}</td>
          </tr>
        ))}
      </tbody>
      </table>
    </div>
  );
}

export default App;