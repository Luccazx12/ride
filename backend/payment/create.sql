drop schema if exists ride cascade;

create schema ride;

create table ride.transaction (
	transaction_id uuid primary key,
	ride_id uuid,
	amount numeric,
	date timestamp,
	status text
);
