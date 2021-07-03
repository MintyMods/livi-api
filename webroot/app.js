import { React, ReactDOM } from "https://unpkg.com/es-react/dev";
import htm from "https://cdn.pika.dev/htm";

const html = htm.bind(React.createElement);
const BACKEND_URL = '/service';
const UI_SERVICE_NAME = 'ServiceName';
const UI_SERVICE_URL = 'ServiceURL';

const ServicePoller = () => {
  const [error, setError] = React.useState(null);
  const [services, setServices] = React.useState([
      { url: "kry.se", name: 'Kry' },
      { url: "google.se", name: 'Google' },
      { url: "www.livi.co.uk", name: 'Livi' },
      { url: "mintymods.info", name: 'Minty' },
    ]);
  const [service, setService] = React.useState(null);    

  React.useEffect(() => {
    sendRequest('GET', null);
  }, []);

  const sendRequest = (method, service) => {
    console.info(method, service);
    let body = service ? JSON.stringify(service) : null;
    fetch(BACKEND_URL, {
      headers: {
       Accept: 'application/json',
       'Content-Type': 'application/json'
     },
      mode: 'cors',
      method,
      body,
    })
    .then((res) => checkResponse(res))
    .then((res) => setServices(res))
    .catch(setError);  
  }

  const checkResponse = (res) => {
    if (!res.ok) {
      throw new Error(res.status + " BackEnd Error: " + res.statusText);
    }
    return res;
  }  

  const addUpdateService = (service) => {
    try {
      if (isValidService(service)) {
        if (isServiceAlreadyExist(service)) {
          sendRequest('POST', service);
        } else {
          sendRequest('PUT', service);
        }
      } 
    } catch (e) {
      setError(e);
    }
  }
  
  const deleteService = (service) => {
    sendRequest('DELETE', service);
  }

  const isValidService = (service) => {
    if (service || service.url.length > 0) {
      return service ? isValidUrl(service.url) : false;
    }
    throw new Error('Please supply a valid URL to poll');
  }
  
  const isValidUrl = (url) => {
    return parsed = new URL(url) ? parsed.protocol === "http:" || parsed.protocol === "https:" : false;
  }

  const isServiceAlreadyExist = (service) => {
    return services.filter((s)=> s.url == service.url).length > 0;
  }

  const editService = (service) => {
    setValue(UI_SERVICE_NAME, service.name);
    setValue(UI_SERVICE_URL, service.url);
  }

  const clearService = () => {
    setValue(UI_SERVICE_NAME, '');
    setValue(UI_SERVICE_URL, '');
    setError(null);
  }
  
  const setValue = (id, value) => {
    document.getElementById(id).value = value;
  }

  const i18n = (msg) => {
    return msg.replace(/([a-z])([A-Z])/g, '$1 $2');
  }

  return html`
    <div className='main'>
      <h1 className='header'>KRY status poller</h1>
      ${error != null &&
        html`
          <div className='error'>${error.message}</div>
          <!-- @todo Remove this error after X secs or activety -->
        `}
        
      <br/>
      <div className='service-form-wrapper'>
      <label htmlFor='${UI_SERVICE_NAME}' className='form-control'>${i18n(UI_SERVICE_NAME)} : </label>
      <input id='${UI_SERVICE_NAME}' className='form-control' placeholder='${i18n(UI_SERVICE_NAME)}'/>
      <br/>
      <label htmlFor='${UI_SERVICE_URL}' className='form-control'>${i18n(UI_SERVICE_URL)} : </label>
      <input id="${UI_SERVICE_URL}"  className='form-control' placeholder='${i18n(UI_SERVICE_URL)}'/>
      <br/>
      <button onClick='${(e)=>addUpdateService({ url:e.target.value, name:this})}' className='btn primary'>${i18n('Save')}</button>
      <button onClick='${(e)=>clearService()}' className='btn secondary'>${i18n('Clear')}</button>
      </div>
      <ul>
        ${services.map(
          (service) => html`
            <li key=${service.url} className='service'><h3>${service.url}</h3> 
            <button onClick='${()=>editService(service)}' className='btn primary'>${i18n('Edit')}</button>
            <button onClick='${()=>deleteService(service)}' className='btn secondary'>${i18n('Delete')}</button>
            </li>
          `
        )}
      </ul>
    </div>
  `;
};

ReactDOM.render(React.createElement(ServicePoller), document.getElementById('app'));
