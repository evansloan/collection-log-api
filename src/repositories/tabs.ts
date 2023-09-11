import CollectionLogTab from '@models/CollectionLogTab';
import Repository from '@repositories/repository';

class TabsRepository extends Repository<CollectionLogTab> {

  protected model = CollectionLogTab;

  public async findByName(pageName: string) {
    return this.model.query()
      .whereLower('name', pageName.toLowerCase())
      .first();
  }
}

export default TabsRepository;
