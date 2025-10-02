
export function Logo() {
  const colors = [
    'text-red-500',
    'text-orange-500',
    'text-yellow-400',
    'text-green-500',
    'text-blue-500',
    'text-purple-500',
  ];
  const title = 'SUDOKU COLOR 3D';

  return (
    <h1 className="text-4xl md:text-5xl font-bold text-center mb-6 md:mb-8 font-headline tracking-tight select-none">
      {title.split('').map((letter, index) => {
        if (letter === ' ') {
          return <span key={index}> </span>;
        }

        const colorClass = colors[index % colors.length];
        let finalColorClass = colorClass;

        if (index >= title.length - 2) { // 3D
          finalColorClass = colors[(index) % colors.length];
        } else if (letter === 'O' && index > 6) { // Second 'O' in COLOR
          finalColorClass = index % 2 === 0 ? 'text-white' : 'text-gray-900 dark:text-gray-200';
        }

        return (
          <span
            key={index}
            className={`inline-block animate-wave ${finalColorClass} transition-transform duration-300 ease-in-out hover:scale-110`}
            style={{
              animationDelay: `${index * 0.1}s`,
              textShadow:
                '0 1px 0 #ccc, 0 2px 0 #c9c9c9, 0 3px 0 #bbb, 0 4px 0 #b9b9b9, 0 5px 0 #aaa, 0 6px 1px rgba(0,0,0,.1), 0 0 5px rgba(0,0,0,.1), 0 1px 3px rgba(0,0,0,.3), 0 3px 5px rgba(0,0,0,.2), 0 5px 10px rgba(0,0,0,.25), 0 10px 10px rgba(0,0,0,.2), 0 20px 20px rgba(0,0,0,.15)',
            }}
          >
            {letter}
          </span>
        );
      })}
    </h1>
  );
}
