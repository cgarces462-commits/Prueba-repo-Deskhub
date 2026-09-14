export default function Campo({
  label,
  name,
  type = 'text',
  value,
  onChange,
  error,
  placeholder,
  children,
  ...rest
}) {
  const id = `campo-${name}`;
  return (
    <div className="campo">
      <label htmlFor={id}>{label}</label>
      {children ? (
        <div id={id}>{children}</div>
      ) : (
        <input
          id={id}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={error ? 'invalido' : ''}
          {...rest}
        />
      )}
      {error && <span className="mensaje-error">{error}</span>}
    </div>
  );
}
