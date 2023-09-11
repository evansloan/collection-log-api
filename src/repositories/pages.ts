import { BaseModel } from '@models/BaseModel';
import CollectionLogPage from '@models/CollectionLogPage';
import Repository from '@repositories/repository';

class PagesRepository extends Repository<CollectionLogPage> {

  protected model = CollectionLogPage;

  public async findByName(pageName: string) {
    return this.model.query()
      .whereLower('name', pageName.toLowerCase())
      .first();
  }
}

export default PagesRepository;
