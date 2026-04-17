import { useAppContext } from '../contexts/AppContext';

export default function Toast() {
  const { toast } = useAppContext();
  return <div id="toast" className={toast ? 'show' : ''}>{toast}</div>;
}
