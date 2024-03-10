drop schema if exists ride cascade;

create schema ride;

create table ride.ride (
	ride_id uuid,
	passenger_id uuid,
	driver_id uuid,
	status text,
	fare numeric,
	distance numeric,
	from_lat numeric,
	from_long numeric,
	to_lat numeric,
	to_long numeric,
	requested_at timestamp,
	accepted_at timestamp,
	started_at timestamp,
	last_position_lat numeric,
	last_position_long numeric
);

create table ride.position (
	position_id uuid,
	ride_id uuid,
	lat numeric,
	long numeric,
	date timestamp
);
