export default function Footer(){
  return (
    <footer className="site-footer">
      <div className="container cluster" style={{justifyContent:"space-between"}}>
        <div className="cluster">
          <img className="brand-logo" src="/assets/tdf-ui/tdf_logo_alt.svg" alt="TDF HQ"/>
          <span>&copy; {new Date().getFullYear()} TDF HQ</span>
        </div>
        <div className="cluster">
          <a href="https://instagram.com" target="_blank" rel="noreferrer">Instagram</a>
          <a href="https://bandcamp.com" target="_blank" rel="noreferrer">Bandcamp</a>
          <a href="https://youtube.com" target="_blank" rel="noreferrer">YouTube</a>
        </div>
      </div>
    </footer>
  );
}
