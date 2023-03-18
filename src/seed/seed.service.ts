import { Injectable } from '@nestjs/common';
import { PokeResponse, Poke } from './interfaces/poke-response.interface';
import { InjectModel } from '@nestjs/mongoose';
import { Pokemon } from '../pokemon/entities/pokemon.entity';
import { Model } from 'mongoose';
import { AxiosAdapter } from 'src/common/adapters/axios.adapter';

@Injectable()
export class SeedService {
  constructor(
    @InjectModel(Pokemon.name)
    private readonly pokemonModel: Model<Pokemon>,

    private readonly http: AxiosAdapter,
  ) {}

  async executeSeed() {
    await this.pokemonModel.deleteMany({});

    const data = await this.http.get<PokeResponse>(
      'https://pokeapi.co/api/v2/pokemon?limit=650',
    );

    let pokemons: Poke[] = [];

    data.results.forEach(({ name, url }) => {
      const segments = url.split('/');
      const number = +segments[segments.length - 2];

      pokemons?.push({ name, number });
    });

    await this.pokemonModel.insertMany(pokemons);

    return data.results;
  }
}
