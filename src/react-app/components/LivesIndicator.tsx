interface Props {
	total: number;
	remaining: number;
}

export function LivesIndicator({ total, remaining }: Props) {
	const hearts = Array.from({ length: total }, (_, i) => i < remaining);
	return (
		<div className="lives" aria-label={`${remaining} of ${total} lives remaining`}>
			{hearts.map((alive, i) => (
				<span key={i} className={alive ? "life life--alive" : "life life--lost"}>
					{alive ? "●" : "○"}
				</span>
			))}
		</div>
	);
}
