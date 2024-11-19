import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity("pkm")
export class PokemonInformation {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  type1: string;

  @Column()
  type2: string;

  @Column()
  total: string;

  @Column()
  hp: string;

  @Column()
  attack: string;

  @Column()
  defense: string;

  @Column()
  status_id: number;
}

@Entity("favor_pkm")
export class PokemonfavorInformation {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  username: string;

  @Column()
  password: string;

  @Column()
  status_id: number;
}
