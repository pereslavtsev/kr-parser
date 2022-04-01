import { ProductEntity } from '@shared/';
import { Expose, Transform } from 'class-transformer';
import type { State } from './state.class';
import { CountryPolitics } from './country-politics.class';
import type { Character } from '../../../common';
import type { DiplomaticRelation } from './diplomatic-relation.class';
import type { Ideology } from '../../../common';
import { PoliticalParty } from './political-party.class';
import type { Idea } from '../../../common';
import { x } from '../../../interface';
import type { Technology } from '../../../common/technologies';
import type { Autonomy } from './autonomy.class';
import { Faction } from './faction.class';
import { Country } from '../../../common/countries';

export class CountryHistory extends ProductEntity {
  @Expose({ name: 'capital' })
  protected readonly capitalId: number;

  @Expose({ name: 'oob' })
  readonly OOB: string;

  @Expose({ name: 'starting_train_buffer' })
  readonly startingTrainBuffer: number | null = null; // TODO: maybe 0?

  @Expose({ name: 'set_cosmetic_tag' })
  readonly cosmeticTag: string | null = null;

  @Expose({ name: 'set_research_slots' })
  readonly researchSlots = 0;

  @Expose({ name: 'set_stability' })
  readonly stability = 0;

  @Expose({ name: 'set_convoys' })
  readonly convoys = 0;

  @Expose({ name: 'set_war_support' })
  readonly warSupport = 0;

  @Expose({ name: 'set_naval_oob' })
  readonly navalOOB: string | null = null;

  // Faction
  @Expose({ name: 'create_faction' })
  protected readonly factionId: string | null = null;
  @Expose({ name: 'remove_from_faction' })
  protected readonly excludedFromFaction: string[] = [];
  get faction(): Faction | null {
    if (!this.factionId) {
      return null;
    }
    return new Faction(this.product, this.factionId);
  }
  async getAlies(): Promise<Country[]> {
    const countries = await this.product.common.countries.load();
    const countryTags = this.autonomies
      .map((autonomy) => autonomy.target)
      .filter((countryTag) => this.excludedFromFaction.includes(countryTag));
    return countries.filter((country) => countryTags.includes(country.tag));
  }

  politics: CountryPolitics;
  readonly diplomaticRelations: DiplomaticRelation[] = [];
  readonly autonomies: Autonomy[] = [];

  makePolitics(): CountryPolitics {
    return new CountryPolitics(this.product, this);
  }

  setPolitics(politics: CountryPolitics): CountryPolitics {
    return (this.politics = politics);
  }

  addDiplomaticRelation(...relations: DiplomaticRelation[]) {
    return this.diplomaticRelations.push(...relations);
  }

  addAutonomy(...autonomies: Autonomy[]) {
    return this.autonomies.push(...autonomies);
  }

  @Expose({ name: 'recruit_character' })
  protected readonly charactersIds: Character['id'][];

  protected readonly characters: Character[] | null = null;

  async getCharacters(): Promise<Character[]> {
    const characters = await this.product.common.characters.load();
    return characters.filter((ch) => this.charactersIds.includes(ch.id));
  }

  async getCapital(): Promise<State> {
    return this.product.history.states.get(this.capitalId);
  }

  // Political parties

  @Expose({ name: 'set_popularities' })
  @Transform(({ value }) => {
    const ratings = new Map();
    Object.entries<Record<Ideology['id'], number>>(value).forEach(
      ([ideologyId, popularity]) => ratings.set(ideologyId, popularity),
    );
    return ratings;
  })
  protected ratings = new Map<Ideology['id'], number>();

  getIdeologyPopularity(ideologyId: Ideology['id']) {
    return this.ratings.get(ideologyId);
  }

  getPoliticalParty(ideologyId: Ideology['id']): PoliticalParty {
    return new PoliticalParty(this.product, this, ideologyId);
  }

  get parties(): PoliticalParty[] {
    return Array.from(this.ratings).map(([ideologyId]) =>
      this.getPoliticalParty(ideologyId),
    );
  }

  @Expose({ name: 'add_ideas' })
  @Transform(({ value }) => x(value))
  protected readonly ideas: Idea['id'][];

  async getIdeas(): Promise<Idea[]> {
    const ideas = await this.product.common.ideas.load();
    return ideas.filter((idea) => this.ideas.includes(idea.id));
  }

  // Technologies
  @Expose({ name: 'set_technology' })
  @Transform(({ value }) =>
    Object.entries(value)
      .filter(([, done]) => !!done)
      .map(([technologyId]) => technologyId),
  )
  protected readonly technologies: Technology['id'][];

  async getTechnologies(): Promise<Technology[]> {
    const technologies = await this.product.common.technologies.load();
    return technologies.filter((technology) =>
      this.technologies.includes(technology.id),
    );
  }
}
