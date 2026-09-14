export default function SearchBar({ valor, onChange, placeholder }) {
  return (
    <div className="buscador">
      <input
        type="search"
        value={valor}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder || 'Buscar...'}
        aria-label="Buscar"
      />
    </div>
  );
}
